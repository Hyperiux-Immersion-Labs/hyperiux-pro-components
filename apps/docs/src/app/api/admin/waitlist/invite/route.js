import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { supabase } from "@/lib/supabase";
import {
  renderWaitlistInviteEmail,
  waitlistInviteSubject,
  waitlistInviteText,
} from "@/lib/emails/waitlist-invite-email";
import { assertAdmin } from "@/lib/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAILS_PER_REQUEST = 200;
const CONCURRENCY = 5;
const DAILY_INVITE_LIMIT = 50;

function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Invitations sent from this endpoint are counted per UTC calendar day
// against DAILY_INVITE_LIMIT, regardless of whether they came from a
// single manual add or a bulk CSV import.
async function getInvitesSentToday() {
  const { count, error } = await supabase
    .from("sent_emails")
    .select("id", { count: "exact", head: true })
    .eq("email_type", "waitlist_invite")
    .eq("status", "success")
    .gte("sent_at", startOfTodayUTC().toISOString());

  if (error) throw new Error(error.message);
  return count || 0;
}

export async function GET() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const sentToday = await getInvitesSentToday();
    return NextResponse.json({
      limit: DAILY_INVITE_LIMIT,
      sentToday,
      remaining: Math.max(0, DAILY_INVITE_LIMIT - sentToday),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function inviteOne(clerk, email) {
  try {
    // notify:false stops Clerk sending its own invite email - we send our
    // own branded one below. The email's CTA links straight to /effects
    // (not the invitation's ticket URL), so this invitation only exists to
    // register the email as invited in Clerk for admin tracking/status.
    //
    // redirectUrl sends the accept link straight to /signup/continue (with
    // __clerk_ticket appended) instead of the default sign-up page, in case
    // the invitation URL is ever used directly again.
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      notify: false,
      ignoreExisting: true,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup/continue`,
    });

    if (!invitation.url) {
      throw new Error("Clerk did not return an invitation URL");
    }

    const emailResult = await sendEmail({
      to: email,
      subject: waitlistInviteSubject,
      react: renderWaitlistInviteEmail(),
      text: waitlistInviteText(),
      emailType: "waitlist_invite",
    });

    if (!emailResult.success) {
      return {
        email,
        success: false,
        error: emailResult.error || "Invitation created but email failed to send",
      };
    }

    return { email, success: true, invitationId: invitation.id };
  } catch (error) {
    console.error("ADMIN_WAITLIST_INVITE_ERROR:", email, error);
    return { email, success: false, error: error.message || "Invite failed" };
  }
}

async function inviteWithConcurrency(clerk, emails, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < emails.length) {
      const current = emails[index];
      index += 1;
      results[index - 1] = await inviteOne(clerk, current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, emails.length) }, worker)
  );

  return results;
}

export async function POST(req) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Accept either a single `email` or a batch of `emails` for backwards compatibility.
    const rawEmails = Array.isArray(body.emails)
      ? body.emails
      : body.email
        ? [body.email]
        : [];

    const normalized = [
      ...new Set(
        rawEmails
          .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
          .filter(Boolean)
      ),
    ];

    if (normalized.length === 0) {
      return NextResponse.json({ error: "Missing email(s)" }, { status: 400 });
    }

    if (normalized.length > MAX_EMAILS_PER_REQUEST) {
      return NextResponse.json(
        { error: `Too many emails - max ${MAX_EMAILS_PER_REQUEST} per request` },
        { status: 400 }
      );
    }

    const invalid = normalized.filter((e) => !EMAIL_RE.test(e));
    let valid = normalized.filter((e) => EMAIL_RE.test(e));

    const sentToday = await getInvitesSentToday();
    const remaining = Math.max(0, DAILY_INVITE_LIMIT - sentToday);
    const overflow = valid.slice(remaining);
    valid = valid.slice(0, remaining);

    const clerk = await clerkClient();
    const invited = valid.length > 0 ? await inviteWithConcurrency(clerk, valid, CONCURRENCY) : [];

    const limitError = `Daily invite limit reached (${DAILY_INVITE_LIMIT}/day). Try again tomorrow.`;
    const results = [
      ...invited,
      ...invalid.map((email) => ({ email, success: false, error: "Invalid email address" })),
      ...overflow.map((email) => ({ email, success: false, error: limitError })),
    ];

    const sentCount = results.filter((r) => r.success).length;
    const failedCount = results.length - sentCount;

    return NextResponse.json({
      success: failedCount === 0,
      results,
      sentCount,
      failedCount,
    });
  } catch (error) {
    console.error("ADMIN_WAITLIST_INVITE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
