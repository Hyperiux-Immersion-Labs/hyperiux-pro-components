import { describe, it, expect, vi } from "vitest";

vi.mock("resend", () => ({ Resend: vi.fn(function Resend() {}) }));
vi.mock("@/lib/supabase", () => ({ supabase: {}, fetchAllRows: vi.fn() }));
vi.mock("@/lib/admin-data", () => ({ getAudience: vi.fn() }));

const { CAMPAIGNS } = await import("@/lib/emails/campaigns");
const { renderCampaign } = await import("@/lib/campaign-send");

describe("campaigns", () => {
  it("have unique ids and a subject", () => {
    expect(new Set(CAMPAIGNS.map((c) => c.id)).size).toBe(CAMPAIGNS.length);
    for (const campaign of CAMPAIGNS) expect(campaign.subject).toBeTruthy();
  });

  it.each(CAMPAIGNS.map((c) => [c.id, c]))("%s renders with a slot for each recipient's unsubscribe link", async (_, campaign) => {
    const html = await renderCampaign(campaign);
    expect(html).toContain('href="https://unsubscribe.placeholder.invalid/"');
    expect(campaign.text({ unsubscribeUrl: "https://u.example/x" })).toContain("https://u.example/x");
  });
});
