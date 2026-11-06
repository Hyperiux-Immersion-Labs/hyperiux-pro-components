import "server-only";
import { createHash } from "crypto";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { fetchAllRows, supabase } from "@/lib/supabase";
import { getAudience } from "@/lib/admin-data";
import { getUnsubscribedEmails, unsubscribeUrl } from "@/lib/email-unsubscribe";

// Sending a campaign (lib/emails/campaigns) from the admin Campaigns tab. A test goes to
// the internal team (or addresses typed in) and is logged as campaign_test:<id>; the real
// send goes to every signed-up account that hasn't opted out of product updates, in
// chunks the page asks for one after another, and is logged as campaign:<id>. Anyone
// already logged as sent is skipped, so a send that stops halfway (closed tab, timeout,
// a failed batch) picks up where it left off, and no one gets it twice.

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Hyperiux Vault <hello@hyperiux.com>";

// Resend takes up to 100 emails per batch call, at 2 calls a second
const BATCH_SIZE = 100;
const BATCH_GAP_MS = 600;
// Accounts per request from the page, so one request stays well under the function timeout
export const CHUNK_SIZE = 200;
export const MAX_TEST_RECIPIENTS = 25;

export const campaignType = (id) => `campaign:${id}`;
export const testType = (id) => `campaign_test:${id}`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLACEHOLDER = "https://unsubscribe.placeholder.invalid/";
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

export const isEmail = (value) => EMAIL_RE.test(value);

function primaryEmail(user) {
  const primary = user.emailAddresses?.find((address) => address.id === user.primaryEmailAddressId) || user.emailAddresses?.[0];
  return primary?.emailAddress?.trim().toLowerCase() || null;
}

// Signed-up accounts' primary emails: "internal" (the team, as the admin counts it) or
// "all". Suspended accounts are left out.
export async function getAccountEmails(audience) {
  const { users } = await getAudience(audience === "internal" ? "internal" : "all");
  const emails = users.filter((user) => !user.banned && !user.locked).map(primaryEmail).filter((email) => email && isEmail(email));
  return [...new Set(emails)];
}

// Everyone the campaign is already logged as delivered to (Resend accepted it)
export async function getSentEmails(type) {
  const rows = await fetchAllRows(() => supabase.from("sent_emails").select("id, recipient_email").eq("email_type", type).eq("status", "success"));
  return new Set(rows.map((row) => row.recipient_email?.toLowerCase()));
}

export async function countLogged(type, status) {
  const { count, error } = await supabase.from("sent_emails").select("id", { count: "exact", head: true }).eq("email_type", type).eq("status", status);
  if (error) throw new Error(error.message);
  return count || 0;
}

export async function lastLogged(type) {
  const { data, error } = await supabase.from("sent_emails").select("sent_at").eq("email_type", type).eq("status", "success").order("sent_at", { ascending: false }).limit(1);
  if (error) throw new Error(error.message);
  return data?.[0]?.sent_at || null;
}

// Who the real send still has to reach, in a stable order
export async function getRemainingRecipients(campaign) {
  const [accounts, optedOut, sent] = await Promise.all([getAccountEmails("all"), getUnsubscribedEmails(), getSentEmails(campaignType(campaign.id))]);
  const eligible = accounts.filter((email) => !optedOut.has(email));
  return {
    accounts: accounts.length,
    optedOut: accounts.length - eligible.length,
    remaining: eligible.filter((email) => !sent.has(email)).sort(),
  };
}

// The email's HTML once, with a placeholder where each recipient's unsubscribe link goes
export async function renderCampaign(campaign) {
  return render(campaign.render({ unsubscribeUrl: PLACEHOLDER }));
}

// Images an email loads from the live site: the ones that don't load yet
export async function missingAssets(campaign) {
  const results = await Promise.all(
    (campaign.assets || []).map(async (url) => {
      try {
        const res = await fetch(url, { method: "HEAD", cache: "no-store" });
        return res.ok ? null : url;
      } catch {
        return url;
      }
    }),
  );
  return results.filter(Boolean);
}

/**
 * Send a campaign to `emails` through Resend's batch API and log every one to sent_emails
 * (awaited: the next chunk reads the log to skip who already has it).
 * Returns { sent: [email], failed: [{ email, error }], logFailed }.
 */
export async function sendCampaign(campaign, emails, { test = false } = {}) {
  const html = await renderCampaign(campaign);
  const type = test ? testType(campaign.id) : campaignType(campaign.id);
  const subject = test ? `[Test] ${campaign.subject}` : campaign.subject;
  const sent = [];
  const failed = [];
  let logFailed = false;

  for (let start = 0; start < emails.length; start += BATCH_SIZE) {
    if (start > 0) await pause(BATCH_GAP_MS);
    const group = emails.slice(start, start + BATCH_SIZE);
    const messages = group.map((email) => {
      const link = unsubscribeUrl(email);
      const personal = html.split(PLACEHOLDER).join(escapeAttr(link));
      return {
        email,
        payload: {
          from: FROM_ADDRESS,
          to: email,
          subject,
          html: personal,
          text: campaign.text({ unsubscribeUrl: link }),
          headers: { "List-Unsubscribe": `<${link}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
          tags: [{ name: "campaign", value: campaign.id.replace(/[^a-zA-Z0-9_-]/g, "_") }],
        },
      };
    });

    // The same recipients in the same campaign always get the same key, so a retried or
    // doubled request (two tabs, a double click) is sent once by Resend
    const key = createHash("sha256").update(`${type}:${group.join(",")}`).digest("hex").slice(0, 48);
    let errorMessage = null;
    try {
      const { error } = await resend.batch.send(
        messages.map((message) => message.payload),
        { idempotencyKey: `${type}:${key}`.slice(0, 256) },
      );
      if (error) errorMessage = error.message || JSON.stringify(error);
    } catch (error) {
      errorMessage = error.message || "Unknown error";
    }
    if (errorMessage) console.error("CAMPAIGN_BATCH_ERROR:", campaign.id, errorMessage);

    const { error: logError } = await supabase.from("sent_emails").insert(
      messages.map((message) => ({
        recipient_email: message.email,
        subject,
        html_content: message.payload.html,
        text_content: message.payload.text,
        email_type: type,
        status: errorMessage ? "failed" : "success",
        error_message: errorMessage,
      })),
    );
    if (logError) {
      console.error("CAMPAIGN_LOG_ERROR:", campaign.id, logError.message);
      // The log is what stops a second send: without it, don't go on
      logFailed = true;
    }

    for (const message of messages) {
      if (errorMessage) failed.push({ email: message.email, error: errorMessage });
      else sent.push(message.email);
    }
    // A batch Resend refused (bad key, rate limit, an unverified sender) will refuse the
    // rest too: stop rather than log the same failure a hundred times over
    if (errorMessage || logFailed) {
      for (const email of emails.slice(start + BATCH_SIZE)) failed.push({ email, error: "Not attempted: the batch before it failed." });
      break;
    }
  }

  return { sent, failed, logFailed };
}
