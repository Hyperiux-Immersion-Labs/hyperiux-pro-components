import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { supabase } from "@/lib/supabase";
import { getAudience } from "@/lib/admin-data";
import { unsubscribeUrl } from "@/lib/email-unsubscribe";

// Test sends of a campaign (lib/emails/campaigns) from the admin Campaigns tab: one email
// per address to the internal team (or addresses typed in), through Resend's email API,
// logged as campaign_test:<id>. That API shares the free plan's 100 emails a day with
// every account email, so the real send to everyone goes out as a Resend Broadcast
// instead (lib/campaign-broadcast).

const resend = new Resend(process.env.RESEND_API_KEY);
// Campaigns go out from their own address, not hello@ that every account and billing email
// uses: Gmail's tab sorting and spam scoring judge a sender by everything it sends, so
// the two shouldn't share a reputation. Replies go to a real inbox. A campaign can set
// its own `from` / `replyTo` (lib/emails/campaigns).
const CAMPAIGN_FROM = "Team Hyperiux <team@vault.hyperiux.com>";
const CAMPAIGN_REPLY_TO = "hello@hyperiux.com";

export const MAX_TEST_RECIPIENTS = 25;

export const testType = (id) => `campaign_test:${id}`;
export const campaignSender = (campaign) => ({ from: campaign.from || CAMPAIGN_FROM, replyTo: campaign.replyTo || CAMPAIGN_REPLY_TO });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLACEHOLDER = "https://unsubscribe.placeholder.invalid/";
// Where each recipient's first name goes: an email that greets you by name reads as
// written to you, which Gmail weighs when picking Primary over Promotions
const NAME_SLOT = "CampaignFirstNameSlot";
const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const isEmail = (value) => EMAIL_RE.test(value);

function primaryEmail(user) {
  const primary = user.emailAddresses?.find((address) => address.id === user.primaryEmailAddressId) || user.emailAddresses?.[0];
  return primary?.emailAddress?.trim().toLowerCase() || null;
}

// Signed-up accounts as { email, firstName }: "internal" (the team, as the admin counts
// it) or "all". Suspended accounts are left out.
export async function getAccounts(audience) {
  const { users } = await getAudience(audience === "internal" ? "internal" : "all");
  const accounts = new Map();
  for (const user of users) {
    const email = primaryEmail(user);
    if (user.banned || user.locked || !email || !isEmail(email) || accounts.has(email)) continue;
    accounts.set(email, { email, firstName: user.firstName?.trim() || null });
  }
  return [...accounts.values()];
}

export async function getAccountEmails(audience) {
  return (await getAccounts(audience)).map((account) => account.email);
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

// The email's HTML once, with placeholders where each recipient's unsubscribe link and
// first name go. `preview` fills them for the admin page.
export async function renderCampaign(campaign, { preview = false } = {}) {
  const html = await render(campaign.render({ unsubscribeUrl: PLACEHOLDER, firstName: NAME_SLOT }));
  return preview ? html.split(NAME_SLOT).join("there") : html;
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
 * Send a test of a campaign to up to MAX_TEST_RECIPIENTS addresses in one Resend batch call,
 * each with their own first name and unsubscribe link, and log each to sent_emails.
 * Returns { sent: [email], failed: [{ email, error }] }.
 */
export async function sendTest(campaign, emails) {
  const [html, accounts] = await Promise.all([renderCampaign(campaign), getAccounts("all")]);
  const names = new Map(accounts.map((account) => [account.email, account.firstName]));
  const subject = `[Test] ${campaign.subject}`;
  const messages = emails.slice(0, MAX_TEST_RECIPIENTS).map((email) => {
    const link = unsubscribeUrl(email);
    const firstName = names.get(email) || null;
    return {
      ...campaignSender(campaign),
      to: email,
      subject,
      html: html.split(PLACEHOLDER).join(escapeAttr(link)).split(NAME_SLOT).join(escapeHtml(firstName || "there")),
      text: campaign.text({ unsubscribeUrl: link, firstName }),
    };
  });

  let errorMessage = null;
  try {
    const { error } = await resend.batch.send(messages);
    if (error) errorMessage = error.message || JSON.stringify(error);
  } catch (error) {
    errorMessage = error.message || "Unknown error";
  }
  if (errorMessage) console.error("CAMPAIGN_TEST_ERROR:", campaign.id, errorMessage);

  const { error: logError } = await supabase.from("sent_emails").insert(
    messages.map((message) => ({
      recipient_email: message.to,
      subject,
      html_content: message.html,
      text_content: message.text,
      email_type: testType(campaign.id),
      status: errorMessage ? "failed" : "success",
      error_message: errorMessage,
    })),
  );
  if (logError) console.error("CAMPAIGN_TEST_LOG_ERROR:", campaign.id, logError.message);

  return {
    sent: errorMessage ? [] : messages.map((message) => message.to),
    failed: errorMessage ? messages.map((message) => ({ email: message.to, error: errorMessage })) : [],
  };
}
