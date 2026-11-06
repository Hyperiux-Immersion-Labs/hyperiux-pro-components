import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin";
import { recordAdminAction } from "@/lib/admin-audit";
import { CAMPAIGNS, getCampaign } from "@/lib/emails/campaigns";
import { MAX_TEST_RECIPIENTS, countLogged, getAccountEmails, isEmail, lastLogged, missingAssets, renderCampaign, sendTest, testType } from "@/lib/campaign-send";
import { getCampaignBroadcast, getSyncPlan, sendBroadcast, syncChunk } from "@/lib/campaign-broadcast";

// The admin Campaigns tab (owner only). GET: the campaigns, where each stands, and how the
// Product Updates segment compares to the signed-up accounts (?preview=<id>: one
// campaign's HTML). POST, by `mode`:
//   test  - email the internal team (or typed addresses) a [Test] copy (lib/campaign-send)
//   sync  - add signed-up accounts to Product Updates, one chunk per request (the page repeats it)
//   send  - send the campaign as one Resend Broadcast to Product Updates
//           (lib/campaign-broadcast), once a test has gone out and the sync is complete

export const maxDuration = 60;

const campaignStatus = async (campaign) => {
  const [tested, lastTest, broadcast] = await Promise.all([countLogged(testType(campaign.id), "success"), lastLogged(testType(campaign.id)), getCampaignBroadcast(campaign)]);
  return { id: campaign.id, name: campaign.name, subject: campaign.subject, tested, lastTest, broadcast };
};

export async function GET(request) {
  if (!(await requireOwner())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const previewId = new URL(request.url).searchParams.get("preview");
    if (previewId) {
      const campaign = getCampaign(previewId);
      if (!campaign) return NextResponse.json({ error: "No such campaign." }, { status: 404 });
      return NextResponse.json({ html: await renderCampaign(campaign, { preview: true }) });
    }

    const plan = await getSyncPlan();
    const campaigns = [];
    // One after another: each reads Resend, which allows 2 requests a second
    for (const campaign of CAMPAIGNS) campaigns.push(await campaignStatus(campaign));
    const internal = await getAccountEmails("internal");
    return NextResponse.json({
      campaigns,
      internal,
      segment: { accounts: plan.accounts, accountsInSegment: plan.accountsInSegment, optedOut: plan.optedOut, reach: plan.reach, pending: plan.pending },
    });
  } catch (error) {
    console.error("ADMIN_CAMPAIGNS_READ_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await requireOwner())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));

  try {
    if (body.mode === "sync") {
      const result = await syncChunk();
      if (!result.pending) await recordAdminAction({ action: "campaign.sync", details: { segment: "Product Updates" } });
      return NextResponse.json(result);
    }

    const campaign = getCampaign(body.campaignId);
    if (!campaign) return NextResponse.json({ error: "No such campaign." }, { status: 404 });

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

      const result = await sendTest(campaign, recipients);
      await recordAdminAction({ action: "campaign.test", details: { campaign: campaign.id, sent: result.sent, failed: result.failed.length } });
      return NextResponse.json(result);
    }

    if (body.mode === "send") {
      if (body.confirm !== campaign.id) return NextResponse.json({ error: "Confirm the campaign to send it." }, { status: 400 });
      if (!(await countLogged(testType(campaign.id), "success"))) {
        return NextResponse.json({ error: "Send a test to the internal team first." }, { status: 409 });
      }
      const existing = await getCampaignBroadcast(campaign);
      if (existing && existing.status !== "draft") {
        return NextResponse.json({ error: `This campaign was already ${existing.status === "queued" ? "queued" : "sent"} as a broadcast.` }, { status: 409 });
      }
      const plan = await getSyncPlan();
      if (plan.pending) return NextResponse.json({ error: `${plan.pending} signed-up accounts aren't in Product Updates yet. Sync first.` }, { status: 409 });

      const broadcastId = await sendBroadcast(campaign);
      await recordAdminAction({ action: "campaign.send", details: { campaign: campaign.id, broadcastId, reach: plan.reach } });
      return NextResponse.json({ broadcastId, reach: plan.reach });
    }

    return NextResponse.json({ error: "mode must be test, sync or send." }, { status: 400 });
  } catch (error) {
    console.error("ADMIN_CAMPAIGNS_POST_ERROR:", body.mode, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
