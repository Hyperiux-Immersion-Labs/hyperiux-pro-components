import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { CAMPAIGNS, getCampaign } from "@/lib/emails/campaigns";
import {
  CHUNK_SIZE,
  MAX_TEST_RECIPIENTS,
  campaignType,
  countLogged,
  getAccountEmails,
  getRemainingRecipients,
  isEmail,
  lastLogged,
  missingAssets,
  renderCampaign,
  sendCampaign,
  testType,
} from "@/lib/campaign-send";
import { getUnsubscribedEmails } from "@/lib/email-unsubscribe";

// The admin Campaigns tab (owner only): list campaigns with where each one stands,
// preview one, send a test to the internal team, then send it to every signed-up account
// one chunk per request (lib/campaign-send). The real send is refused until a test of
// that campaign has gone out.

export const maxDuration = 60;

async function campaignStatus(campaign) {
  const [{ accounts, optedOut, remaining }, sent, failed, tested, lastTest, lastSent] = await Promise.all([
    getRemainingRecipients(campaign),
    countLogged(campaignType(campaign.id), "success"),
    countLogged(campaignType(campaign.id), "failed"),
    countLogged(testType(campaign.id), "success"),
    lastLogged(testType(campaign.id)),
    lastLogged(campaignType(campaign.id)),
  ]);
  return { id: campaign.id, name: campaign.name, subject: campaign.subject, accounts, optedOut, remaining: remaining.length, sent, failed, tested, lastTest, lastSent };
}

export async function GET(request) {
  if (!(await requireOwner())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const previewId = new URL(request.url).searchParams.get("preview");
    if (previewId) {
      const campaign = getCampaign(previewId);
      if (!campaign) return NextResponse.json({ error: "No such campaign." }, { status: 404 });
      return NextResponse.json({ html: await renderCampaign(campaign) });
    }

    const [campaigns, internal] = await Promise.all([Promise.all(CAMPAIGNS.map(campaignStatus)), getAccountEmails("internal")]);
    return NextResponse.json({ campaigns, internal, chunkSize: CHUNK_SIZE });
  } catch (error) {
    console.error("ADMIN_CAMPAIGNS_READ_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await requireOwner())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const campaign = getCampaign(body.campaignId);
  if (!campaign) return NextResponse.json({ error: "No such campaign." }, { status: 404 });

  try {
    const missing = await missingAssets(campaign);
    if (missing.length) {
      return NextResponse.json({ error: `These images don't load on the live site yet, so the email would arrive broken. Deploy them first: ${missing.join(", ")}` }, { status: 409 });
    }

    if (body.mode === "test") {
      const typed = Array.isArray(body.emails) ? body.emails.map((email) => String(email).trim().toLowerCase()).filter(Boolean) : [];
      const invalid = typed.filter((email) => !isEmail(email));
      if (invalid.length) return NextResponse.json({ error: `Not an email address: ${invalid.join(", ")}` }, { status: 400 });
      const recipients = [...new Set(typed.length ? typed : await getAccountEmails("internal"))];
      if (!recipients.length) return NextResponse.json({ error: "No internal team accounts found. Type the addresses to test with." }, { status: 400 });
      if (recipients.length > MAX_TEST_RECIPIENTS) {
        return NextResponse.json({ error: `A test goes to at most ${MAX_TEST_RECIPIENTS} addresses (${recipients.length} given).` }, { status: 400 });
      }

      const result = await sendCampaign(campaign, recipients, { test: true });
      await recordAdminAction({ action: "campaign.test", details: { campaign: campaign.id, sent: result.sent, failed: result.failed.length } });
      return NextResponse.json(result);
    }

    if (body.mode === "send") {
      if (body.confirm !== campaign.id) return NextResponse.json({ error: "Confirm the campaign to send it." }, { status: 400 });
      if (!(await countLogged(testType(campaign.id), "success"))) {
        return NextResponse.json({ error: "Send a test to the internal team first." }, { status: 409 });
      }

      // Opt-outs read fresh at the start of a send, then held for its later chunks
      if (body.first) await getUnsubscribedEmails({ fresh: true });
      const { remaining } = await getRemainingRecipients(campaign);
      const chunk = remaining.slice(0, CHUNK_SIZE);
      if (!chunk.length) return NextResponse.json({ sent: [], failed: [], remaining: 0 });

      const result = await sendCampaign(campaign, chunk);
      if (result.sent.length) {
        await recordAdminAction({ action: "campaign.send", details: { campaign: campaign.id, sent: result.sent.length, failed: result.failed.length } });
      }
      return NextResponse.json({
        sent: result.sent,
        failed: result.failed,
        logFailed: result.logFailed,
        remaining: remaining.length - result.sent.length,
      });
    }

    return NextResponse.json({ error: "mode must be test or send." }, { status: 400 });
  } catch (error) {
    console.error("ADMIN_CAMPAIGNS_SEND_ERROR:", campaign.id, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
