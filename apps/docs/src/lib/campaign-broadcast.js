import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { PRODUCT_UPDATES_SEGMENT_ID } from "@/lib/email-unsubscribe";
import { campaignSender, getAccounts } from "@/lib/campaign-send";

// The real send of a campaign: one Resend Broadcast to the Product Updates segment.
// Broadcasts don't use the free plan's 100 emails a day (that budget stays with account
// emails); the free marketing plan is limited by contacts (1,000) instead.
//
// Every signed-up account, internal ones included, is a contact in Product Updates: the
// sync adds the ones that aren't, with their first name for the greeting. It never
// changes anyone's unsubscribed flag, so whoever turned product updates off (the
// dashboard switch, an unsubscribe link) stays off, and Resend skips them. People who
// subscribed some other way and are in the segment get the broadcast too.

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend allows 2 requests a second per team; staying under it leaves room for the
// account emails the site sends meanwhile
const GAP_MS = 700;
// Work per sync request, so each stays under the function timeout; the page repeats it
const SYNC_BUDGET_MS = 40_000;
// Resend fills these in per recipient
const RESEND_UNSUBSCRIBE = "{{{RESEND_UNSUBSCRIBE_URL}}}";
const RESEND_FIRST_NAME = "{{{contact.first_name|there}}}";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const broadcastName = (campaign) => `Vault campaign: ${campaign.id}`;

async function call(request) {
  for (let attempt = 0; ; attempt += 1) {
    const { data, error } = await request();
    if (!error) return data;
    if (error.name === "rate_limit_exceeded" && attempt < 3) {
      await pause(1500);
      continue;
    }
    throw new Error(`${error.name}: ${error.message}`);
  }
}

async function listAll(list) {
  const items = [];
  let after;
  for (;;) {
    const page = await call(() => list({ limit: 100, ...(after ? { after } : {}) }));
    items.push(...(page?.data || []));
    if (!page?.has_more || !page.data?.length) return items;
    after = page.data[page.data.length - 1].id;
    await pause(GAP_MS);
  }
}

/**
 * Where Product Updates stands against the signed-up accounts, and what the sync still
 * has to do: create a contact, add one to the segment, or give one its first name.
 */
export async function getSyncPlan() {
  const accounts = await getAccounts("all");
  const contacts = await listAll((options) => resend.contacts.list(options));
  await pause(GAP_MS);
  const members = await listAll((options) => resend.contacts.list({ ...options, segmentId: PRODUCT_UPDATES_SEGMENT_ID }));

  const contactByEmail = new Map(contacts.map((contact) => [contact.email.toLowerCase(), contact]));
  const memberEmails = new Set(members.map((member) => member.email.toLowerCase()));
  const create = [];
  const add = [];
  const name = [];
  for (const account of accounts) {
    const contact = contactByEmail.get(account.email);
    if (!contact) {
      create.push(account);
      continue;
    }
    if (!memberEmails.has(account.email)) add.push(account);
    if (!contact.first_name && account.firstName) name.push(account);
  }

  return {
    accounts: accounts.length,
    accountsInSegment: accounts.filter((account) => memberEmails.has(account.email)).length,
    optedOut: accounts.filter((account) => contactByEmail.get(account.email)?.unsubscribed).length,
    // Everyone the broadcast would reach right now: subscribed members of the segment
    reach: members.filter((member) => !member.unsubscribed).length,
    pending: create.length + add.length + name.length,
    create,
    add,
    name,
  };
}

// One request's worth of the sync. Returns { pending, failed: [{ email, error }] }.
export async function syncChunk() {
  const started = Date.now();
  const plan = await getSyncPlan();
  const steps = [
    ...plan.create.map((account) => () =>
      resend.contacts.create({ email: account.email, firstName: account.firstName || undefined, unsubscribed: false, segments: [{ id: PRODUCT_UPDATES_SEGMENT_ID }] }),
    ),
    ...plan.add.map((account) => () => resend.contacts.segments.add({ email: account.email, segmentId: PRODUCT_UPDATES_SEGMENT_ID })),
    ...plan.name.map((account) => () => resend.contacts.update({ email: account.email, firstName: account.firstName })),
  ];
  const emails = [...plan.create, ...plan.add, ...plan.name].map((account) => account.email);

  const failed = [];
  let done = 0;
  for (const [index, step] of steps.entries()) {
    if (Date.now() - started > SYNC_BUDGET_MS) break;
    try {
      await call(step);
    } catch (error) {
      failed.push({ email: emails[index], error: error.message });
    }
    done += 1;
    await pause(GAP_MS);
  }
  return { pending: steps.length - done + failed.length, failed };
}

// The campaign's broadcast in Resend, newest first, or null
export async function getCampaignBroadcast(campaign) {
  const broadcasts = await listAll((options) => resend.broadcasts.list(options));
  const mine = broadcasts.filter((broadcast) => broadcast.name === broadcastName(campaign));
  mine.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return mine.find((broadcast) => broadcast.status !== "draft") || mine[0] || null;
}

// The broadcast's HTML and text, with Resend's per-recipient first name and unsubscribe link
export async function renderForBroadcast(campaign) {
  const vars = { unsubscribeUrl: RESEND_UNSUBSCRIBE, firstName: RESEND_FIRST_NAME };
  return { html: await render(campaign.render(vars)), text: campaign.text(vars) };
}

// Create the campaign's broadcast to Product Updates and send it now. Returns its id.
export async function sendBroadcast(campaign) {
  const { html, text } = await renderForBroadcast(campaign);
  const created = await call(() =>
    resend.broadcasts.create({
      name: broadcastName(campaign),
      segmentId: PRODUCT_UPDATES_SEGMENT_ID,
      ...campaignSender(campaign),
      subject: campaign.subject,
      html,
      text,
      send: true,
    }),
  );
  return created.id;
}
