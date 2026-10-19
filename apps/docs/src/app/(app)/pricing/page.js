import dynamic from "next/dynamic";
import VaultShell from "@/Layouts/VaultShell";
import { getSearchIndexEffects } from "@/lib/search-index";
import PricingHero from "@/components/Pricing/pricing-hero/PricingHero";
import { FAQJSONLD, WebpageJsonLd } from "@/lib/json-ld";
import { createPageMetadata } from "@/lib/seo-metadata";
import SectionOverlay from "@/components/Animations/SectionOverlay";
import { PLANS, getMonthlyEquivalent, formatPrice } from "@/lib/plans";

// Below-the-fold sections load as separate chunks (still server-rendered)
const FAQ = dynamic(() => import("@/homepage/sections/FAQ"));
const Footer = dynamic(() => import("@/homepage/sections/Footer"));
const PricingFinder = dynamic(() => import("@/components/Pricing/exploded/PricingFinder"));
const PricingCredits = dynamic(() => import("@/components/Pricing/exploded/PricingCredits"));
const PricingUseCase = dynamic(() => import("@/components/Pricing/exploded/PricingUseCase"));
const PricingProCompare = dynamic(() => import("@/components/Pricing/exploded/PricingProCompare"));
const PricingPlansHome = dynamic(() => import("@/homepage/sections/PricingPlansHome"));

export const metadata = createPageMetadata({
  title: "Hyperiux Vault Pricing | Pro React Effects Library",
  description:
    `Simple Vault pricing: start free, go Pro for every effect from ${formatPrice(getMonthlyEquivalent("pro", "yearly"))}/month, or Pro+ for every effect and the full template catalogue with ${PLANS.pro_plus.installsPerDay} installs a day.`,
  path: "/pricing",
  image:
    "https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/seo/pricing.jpg",
});

// Static: plans are defined in code and the page is the same for everyone. Its
// only fetch is the navbar's effect search list (Sanity), so it rebuilds only
// when an effect is published. INR / USD is chosen in the browser (useCurrency).
export default async function PricingPage() {
  const effects = await getSearchIndexEffects();

  return (
    <>
      <WebpageJsonLd metadata={metadata} />
      <FAQJSONLD faqs={faqItems} />
      <VaultShell effects={effects}>
        <main id="main-content">
          <PricingHero />
          {/* Plans through FAQ are one sheet that scales in after the hero, like the homepage */}
          {/* Above the footer (z-200), whose ribbons reach up behind the FAQ */}
          <SectionOverlay className="relative z-201">
            {/* The homepage plans section, reused as is; #plans is the hero's "See the plans" target */}
            <div id="plans" className="home-type">
              <PricingPlansHome checkout />
              <PricingFinder />
            </div>
            <div className="home-type">
              {/* <PricingCredits /> */}
              <PricingProCompare />
            </div>
            <PricingUseCase useCases={USE_CASES} />
            <FAQ faqItems={faqItems} translateTop={false} />
          </SectionOverlay>
        </main>
        <Footer/>
      </VaultShell>
    </>
  );
}
const USE_CASES = [
  {
    id: 1,
    title: "Commercial Use",
    text: "Free effects are open source under MPL 2.0 and fine for commercial and client work. Pro effects use the proprietary Hyperiux Pro License, built for production use on client sites, SaaS products, and internal tools alike.",
    link: "/effects",
  },
  {
    id: 2,
    title: "Ownership",
    text: "Every effect you install is source-first - the files land in your repository. You inspect, adapt, and maintain them like the rest of your front end, with no runtime dependency on Hyperiux.",
    link: "/effects/free",
  },
  {
    id: 3,
    title: "Team & Agency Use",
    text: "Each Pro or Pro+ subscription covers one person (one seat). Agencies and teams that need more seats should contact us rather than sharing one login.",
    link: "mailto:hello@hyperiux.com",
  },
];

const faqItems = [
  {
    id: "faq1",
    question: "Is Pro available now?",
    answer:
      "Yes. Free Core is available immediately with a free account, and Pro is available today through self-serve checkout - no invite, approval, or waitlist needed.",
  },
  {
    id: "faq3",
    question: "How much do Pro and Pro+ cost?",
    answer:
      "Pro is $27 a quarter or $79 a year. Pro+ is $57 a quarter or $179 a year. Visitors from India see INR prices (Pro ₹1,347 a quarter or ₹4,490 a year, Pro+ ₹2,997 a quarter or ₹8,999 a year), with 18% GST added at checkout.",
  },
  {
    id: "faq4",
    question: "Can I use Free Core without an account?",
    answer:
      "No. Anyone can preview effects on the site, but copying the code or installing it with the CLI needs a free account.",
  },
  {
    id: "faq5",
    question: "How does billing work?",
    answer:
      "Your plan is billed automatically to your saved payment method, every 3 months or once a year. You'll get a receipt by email each time you're charged, and you can update or remove your payment method at any time.",
  },
  {
    id: "faq6",
    question: "Can I switch plans or billing period?",
    answer:
      "Pro subscribers can upgrade to Pro+ at any time: click Upgrade to Pro+, pay, and Pro+ starts right away while your Pro plan is cancelled so it doesn't renew. Other changes happen at the end of your billing period: let your plan run out, then pick the new one. Templates you've redeemed and unused credits stay yours, and code you've installed stays in its projects.",
  },
  {
    id: "faq-installs",
    question: "What counts as an install?",
    answer:
      "Each new effect you copy from the site, add with the Hyperiux CLI or pull in through MCP counts once per day, whichever way you get it. Every install needs a free account: Free includes 3 a day, Pro 5 a day and Pro+ 10 a day. Getting the same effect again that day doesn't count twice, and effects you've already got that day stay available even once the limit is reached.",
  },
  {
    id: "faq-credits",
    question: "How do template credits work?",
    answer:
      "Each credit unlocks one whole template, yours to keep even if you cancel. Pro gets 3 credits a year on yearly billing (quarterly Pro has none) for the selected catalogue. Pro+ gets 5 a year on yearly billing (1 every quarter on quarterly) for the full catalogue. Unused credits roll over while your plan is active. You can also buy any template individually, no plan needed.",
  },
  {
    id: "faq7",
    question: "What happens if I cancel my plan?",
    answer:
      "Your plan's access continues until the end of the current billing period, then reverts to the free tier. Pro effects you installed while subscribed stay in those projects and you can keep using them there. New downloads, and using Pro effects in new client projects, need an active plan. Free effects are MPL open source and aren't affected.",
  },
  {
    id: "faq-license",
    question: "How are effects licensed?",
    answer:
      "Free effects are open source under the Mozilla Public License 2.0: use them in personal and commercial projects, including client work, with no attribution required. Pro effects use the proprietary Hyperiux Pro License: use them in personal, commercial and client projects, but don't redistribute, resell or share the source. Each Pro or Pro+ subscription covers one seat.",
  },
  {
    id: "faq8",
    question: "Do you offer refunds?",
    answer:
      "Payments aren't refunded once access has been granted, except for duplicate charges, failure to deliver access, or fraud. If one of those applies, email support@hyperiux.com within 30 days. You can cancel anytime to stop future billing. Full details are in the Refund Policy.",
  },
  {
    id: "faq9",
    question: "Can my team or agency use one license?",
    answer:
      "Each Pro or Pro+ subscription covers one person (one seat), so please don't share a single login. If your team or agency needs more seats, email hello@hyperiux.com.",
  },
  {
    id: "faq10",
    question: "Do you offer agency or multi-seat pricing?",
    answer:
      "Each subscription covers one seat. For more seats, email hello@hyperiux.com with your team size and we'll sort it out with you.",
  },
  {
    id: "faq11",
    question: "What happens to effects I've already installed if I downgrade?",
    answer:
      "Nothing changes in your codebase. Downgrading stops access to installing new Pro effects; Pro code you've already installed keeps working in those projects, while new client projects with Pro effects need an active plan.",
  },
  {
    id: "faq12",
    question: "Do effects require GSAP, Three.js, Lenis, or other libraries?",
    answer:
      "Some do, some don't - every effect page lists its exact dependencies before you install, so you know the setup cost upfront. Scroll and text effects are often dependency-light; WebGL scenes typically require Three.js and React Three Fiber 9, which needs React 19 (Next.js 15+).",
  },
  {
    id: "faq13",
    question: "Is Vault compatible with the Next.js App Router?",
    answer:
      "Yes. Effects are built with the App Router in mind and documented for client-component boundaries. Pages Router projects are supported too, with setup notes on each effect page; page transitions built on next-transition-router need the App Router.",
  },
  {
    id: "faq14",
    question:
      "Do you offer discounts for students, nonprofits, or open-source projects?",
    answer:
      "We review student, nonprofit, and open-source discount requests case by case - email hello@hyperiux.com with a short description of your use case.",
  },
];
