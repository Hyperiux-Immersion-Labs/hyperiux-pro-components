import { setProductUpdates, verifyUnsubscribeToken } from "@/lib/email-unsubscribe";

// The unsubscribe link in campaign test emails (lib/campaign-send); broadcasts use
// Resend's own link, which sets the same flag. Opening it shows a confirm button rather
// than unsubscribing at once, because mail scanners open every link in an email. The button POSTs here (as would a mail app's one-click unsubscribe,
// if campaigns ever send the List-Unsubscribe header again). It turns off product
// updates, the same switch as the dashboard's Settings, and needs no sign-in: the
// signed token is the proof.

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function page(title, body, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)} · Hyperiux Vault</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f2f1ef;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1c1c;">
<main style="max-width:440px;margin:24px;padding:40px;background:#fff;">
<h1 style="margin:0 0 12px;font-size:24px;font-weight:500;">${escapeHtml(title)}</h1>
${body}
</main></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

const text = (value) => `<p style="margin:0 0 20px;font-size:15px;line-height:24px;color:#6b6b6b;">${value}</p>`;
const invalid = () => page("This link doesn’t work", text("The unsubscribe link is incomplete or has expired. You can turn off product updates any time in your dashboard’s Settings."), 400);

async function params(request) {
  const url = new URL(request.url);
  let email = url.searchParams.get("e");
  let token = url.searchParams.get("t");
  if (request.method === "POST" && (!email || !token)) {
    const form = await request.formData().catch(() => null);
    email = email || form?.get("e");
    token = token || form?.get("t");
  }
  return { email: email ? String(email).trim().toLowerCase() : "", token: token ? String(token) : "" };
}

export async function GET(request) {
  const { email, token } = await params(request);
  if (!verifyUnsubscribeToken(email, token)) return invalid();
  return page(
    "Unsubscribe from Hyperiux emails?",
    `${text(`You won’t get product news or announcements at <strong style="color:#1c1c1c;">${escapeHtml(email)}</strong>. Account and billing emails still arrive.`)}
<form method="post"><input type="hidden" name="e" value="${escapeHtml(email)}"><input type="hidden" name="t" value="${escapeHtml(token)}">
<button type="submit" style="padding:13px 28px;border:0;background:#1c1c1c;color:#fff;font-size:15px;cursor:pointer;">Unsubscribe</button></form>`,
  );
}

export async function POST(request) {
  const { email, token } = await params(request);
  if (!verifyUnsubscribeToken(email, token)) return invalid();
  try {
    await setProductUpdates(email, false);
  } catch (error) {
    console.error("EMAIL_UNSUBSCRIBE_ERROR:", error);
    return page("Something went wrong", text("We couldn’t unsubscribe you just now. Please try again in a minute."), 502);
  }
  return page("You’re unsubscribed", text(`We won’t send product news or announcements to <strong style="color:#1c1c1c;">${escapeHtml(email)}</strong> again. Changed your mind? Turn product updates back on in your dashboard’s Settings.`));
}
