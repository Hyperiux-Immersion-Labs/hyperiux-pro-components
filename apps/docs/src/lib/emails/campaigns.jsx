import "server-only";
import { DiwaliEmail, diwaliSubject, diwaliText } from "@/lib/emails/diwali-email";

// One-off marketing emails the owner sends from the admin Campaigns tab
// (app/api/admin/campaigns). To add one: write its template in lib/emails, upload its
// images to public/emails/<folder> and deploy them (emails load images from the live
// site), then list it here. `id` never changes once sent: it's how the log knows who
// already has it.
export const CAMPAIGNS = [
  {
    id: "diwali-2026",
    name: "Diwali 2026",
    subject: diwaliSubject,
    // Images the email loads from the live site, checked before anything is sent
    assets: ["diwali-hero.jpg", "icon-x.png", "icon-linkedin.png", "icon-github.png", "icon-instagram.png"].map((file) => `https://vault.hyperiux.com/emails/diwali/${file}`),
    render: ({ unsubscribeUrl }) => <DiwaliEmail unsubscribeUrl={unsubscribeUrl} />,
    text: ({ unsubscribeUrl }) => diwaliText({ unsubscribeUrl }),
  },
];

export const getCampaign = (id) => CAMPAIGNS.find((campaign) => campaign.id === id) || null;
