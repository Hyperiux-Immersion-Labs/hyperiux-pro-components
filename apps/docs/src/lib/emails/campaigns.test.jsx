import { describe, it, expect, vi } from "vitest";

vi.mock("resend", () => ({ Resend: vi.fn(function Resend() {}) }));
vi.mock("@/lib/supabase", () => ({ supabase: {}, fetchAllRows: vi.fn() }));
vi.mock("@/lib/admin-data", () => ({ getAudience: vi.fn() }));

const { CAMPAIGNS } = await import("@/lib/emails/campaigns");
const { renderCampaign } = await import("@/lib/campaign-send");
const { renderForBroadcast } = await import("@/lib/campaign-broadcast");

describe("campaigns", () => {
  it("have unique ids and a subject", () => {
    expect(new Set(CAMPAIGNS.map((c) => c.id)).size).toBe(CAMPAIGNS.length);
    for (const campaign of CAMPAIGNS) expect(campaign.subject).toBeTruthy();
  });

  it.each(CAMPAIGNS.map((c) => [c.id, c]))("%s renders with a slot for each recipient's unsubscribe link", async (_, campaign) => {
    const html = await renderCampaign(campaign);
    expect(html).toContain('href="https://unsubscribe.placeholder.invalid/"');
    expect(html).toContain("CampaignFirstNameSlot");
    expect(await renderCampaign(campaign, { preview: true })).not.toContain("CampaignFirstNameSlot");
    expect(campaign.text({ unsubscribeUrl: "https://u.example/x", firstName: "Asha" })).toMatch(/Hi Asha,[\s\S]*https:\/\/u.example\/x/);
  });

  it.each(CAMPAIGNS.map((c) => [c.id, c]))("%s broadcast uses Resend's first name and unsubscribe variables", async (_, campaign) => {
    const { html, text } = await renderForBroadcast(campaign);
    expect(html).toContain('href="{{{RESEND_UNSUBSCRIBE_URL}}}"');
    expect(html).toContain("{{{contact.first_name|there}}}");
    expect(html).not.toContain("placeholder.invalid");
    expect(text).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}");
  });
});
