import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { Resend } from "resend";

// Marketing email opt-out, shared by the dashboard's "Product updates" switch and the
// unsubscribe link in campaign emails. The choice lives on the account's Resend contact
// (contacts are account-wide in Resend v6): `unsubscribed` true means no campaigns.
// Account and billing emails aren't optional, so they never check it.

// Resend segment "Product Updates" (overridable per environment)
export const PRODUCT_UPDATES_SEGMENT_ID = process.env.RESEND_PRODUCT_UPDATES_SEGMENT_ID || "d2ba4cd4-0112-430f-94e1-38b170d1b9b3";

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vault.hyperiux.com";
// Signs unsubscribe links so no one can opt someone else out. Falls back to the Resend
// key (already a server secret) so links work without a new env var; rotating it only
// invalidates links in emails already sent.
const SECRET = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY;

const normalize = (email) => String(email || "").trim().toLowerCase();

function sign(email) {
  return createHmac("sha256", `unsubscribe:${SECRET}`).update(normalize(email)).digest("base64url").slice(0, 32);
}

export function verifyUnsubscribeToken(email, token) {
  if (!email || typeof token !== "string") return false;
  const expected = Buffer.from(sign(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(email) {
  const params = new URLSearchParams({ e: normalize(email), t: sign(email) });
  return `${SITE_URL}/api/email/unsubscribe?${params}`;
}

// The contact for this email, or null when there's none yet
export async function findContact(email) {
  const { data, error } = await resend.contacts.get({ email: normalize(email) });
  if (error && error.name !== "not_found") throw new Error(`${error.name}: ${error.message}`);
  return data || null;
}

// Turn product updates on or off for an email, creating the contact (in the Product
// Updates segment) the first time
export async function setProductUpdates(rawEmail, subscribed) {
  const email = normalize(rawEmail);
  const contact = await findContact(email);
  if (!contact) {
    const { error } = await resend.contacts.create({ email, unsubscribed: !subscribed, segments: [{ id: PRODUCT_UPDATES_SEGMENT_ID }] });
    if (error) throw new Error(`${error.name}: ${error.message}`);
    return;
  }
  const { error: updateError } = await resend.contacts.update({ email, unsubscribed: !subscribed });
  if (updateError) throw new Error(`${updateError.name}: ${updateError.message}`);
  // An existing contact (the footer signup, an older switch) joins the segment if it isn't in it
  const { data: segments, error: listError } = await resend.contacts.segments.list({ email });
  if (listError) throw new Error(`${listError.name}: ${listError.message}`);
  if (!(segments?.data || []).some((segment) => segment.id === PRODUCT_UPDATES_SEGMENT_ID)) {
    const { error: addError } = await resend.contacts.segments.add({ email, segmentId: PRODUCT_UPDATES_SEGMENT_ID });
    if (addError) throw new Error(`${addError.name}: ${addError.message}`);
  }
}

// Every opted-out email across all Resend contacts. Paging runs at Resend's 2 requests a
// second, so the set is held for a few minutes between campaign sends.
const OPT_OUT_TTL_MS = 3 * 60_000;
let optOutCache = null;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getUnsubscribedEmails({ fresh = false } = {}) {
  if (!fresh && optOutCache && Date.now() - optOutCache.at < OPT_OUT_TTL_MS) return optOutCache.emails;
  const emails = new Set();
  let after;
  for (;;) {
    const { data, error } = await resend.contacts.list({ limit: 100, ...(after ? { after } : {}) });
    if (error) throw new Error(`${error.name}: ${error.message}`);
    for (const contact of data?.data || []) {
      if (contact.unsubscribed) emails.add(normalize(contact.email));
    }
    if (!data?.has_more || !data.data?.length) break;
    after = data.data[data.data.length - 1].id;
    await pause(550);
  }
  optOutCache = { at: Date.now(), emails };
  return emails;
}

export function forgetUnsubscribedEmails() {
  optOutCache = null;
}
