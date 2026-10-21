import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { clearClerkUsersCache } from "@/lib/admin-data";
import { sendEmail } from "@/lib/resend";

// "Create user" in the Users tab: a super admin makes an account with an email, a first
// name and a password they choose, and can email the sign-in details to its owner (or copy the
// password from the modal and share it themselves). The email is verified from the start.
// The password is never stored or logged here: the email that carries it is an
// "account_credentials" email, whose body never reaches the email log (lib/email-redaction).
// Clerk's user.created webhook does the rest, as for any sign-up.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || "https://vault.hyperiux.com";

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Clerk's own words for why it refused (email taken, password too weak or found in a breach)
function clerkMessage(error) {
  return error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || null;
}

function credentialsEmail({ name, email, password }) {
  const signIn = `${APP_URL()}/sign-in`;
  const hi = name ? `Hi ${name},` : "Hi,";
  return {
    subject: "Your Hyperiux Vault account is ready",
    text: `${hi}\n\nThe Hyperiux Vault team created an account for you.\n\nEmail: ${email}\nPassword: ${password}\n\nSign in: ${signIn}\n\nChange your password once you're in: Dashboard → Settings.`,
    html: `<div style="background:#111111;padding:40px 24px;font-family:Helvetica,Arial,sans-serif;color:#ffffff">
  <div style="max-width:480px;margin:0 auto">
    <p style="font-size:22px;margin:0 0 16px">Your account is ready</p>
    <p style="font-size:15px;line-height:1.6;color:#cccccc;margin:0 0 24px">${escape(hi)} the Hyperiux Vault team created an account for you. Sign in with:</p>
    <p style="font-size:15px;line-height:1.8;margin:0 0 24px;padding:16px;background:#1d1d1d">Email: ${escape(email)}<br />Password: <span style="font-family:Menlo,Consolas,monospace">${escape(password)}</span></p>
    <a href="${escape(signIn)}" style="display:inline-block;background:#ff5f00;color:#111111;text-decoration:none;padding:12px 20px;font-size:15px">Sign in</a>
    <p style="font-size:13px;line-height:1.6;color:#939393;margin:24px 0 0">Change your password once you're in: Dashboard → Settings.</p>
  </div>
</div>`,
  };
}

export async function POST(request) {
  if (!(await requirePermission("users.create"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const firstName = String(body.firstName || "").trim().slice(0, 64);
  const lastName = String(body.lastName || "").trim().slice(0, 64);
  const sendDetails = body.sendEmail === true;

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!firstName) return NextResponse.json({ error: "Enter their first name." }, { status: 400 });
  if (password.length < MIN_PASSWORD) return NextResponse.json({ error: `The password needs at least ${MIN_PASSWORD} characters.` }, { status: 400 });

  const clerk = await clerkClient();
  let user;
  try {
    user = await clerk.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      ...(lastName ? { lastName } : {}),
    });
  } catch (error) {
    // Never log the request body: it holds the password
    console.error("ADMIN_CREATE_USER_ERROR:", clerkMessage(error) || error?.message);
    return NextResponse.json({ error: clerkMessage(error) || "Couldn't create the account." }, { status: error?.status === 422 ? 422 : 500 });
  }

  // The Users list reads a minute-old copy of Clerk's; this makes it show the new account now
  clearClerkUsersCache();

  // The account exists either way; a failed email is reported, not undone
  let emailed = false;
  let emailError = null;
  if (sendDetails) {
    const message = credentialsEmail({ name: firstName, email, password });
    const result = await sendEmail({ to: email, emailType: "account_credentials", ...message });
    emailed = result?.success !== false;
    if (!emailed) emailError = "Account created, but the email couldn't be sent. Copy the password and share it yourself.";
  }

  await recordAdminAction({ action: "user.create", targetClerkUserId: user.id, details: { email, emailed } });

  return NextResponse.json({ id: user.id, email, emailed, emailError });
}
