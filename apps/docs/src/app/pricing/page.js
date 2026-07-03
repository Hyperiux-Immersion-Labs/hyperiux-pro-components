import VaultShell from "@/Layouts/VaultShell";
import Hero from "@/components/Pricing/Hero";
import Pricing from "@/components/LandpageV2/Pricing";
import GlowingPlates from "@/Experience/GlowingPlates";
import Footer from "@/components/LandpageV2/Footer";
import CTA2 from "@/components/LandpageV2/CTA2";
import PricingCompareTable from "@/components/Pricing/PricingCompareTable";
import PricingLicense from "@/components/Pricing/PricingLicense";
import { FAQJSONLD, WebpageJsonLd } from "@/lib/json-ld";
import FAQs from "@/components/LandpageV2/FAQs";

export const metadata = {
  title: "Hyperiux Vault Pricing | Pro React Effects Library",
  description: "Get unlimited access to premium, highly interactive React and Tailwind components. Elevate your website design with fluid animations, custom cursors, and advanced WebGL components.",
};



export default function PricingPage() {
  return (
    <>
    <WebpageJsonLd metadata={metadata}/>
    <FAQJSONLD faqs={faqItems}/>
      <VaultShell>
        <Hero />
        <GlowingPlates waitForLoader={false} />
        {/* <Pricing enableColorSwitch={false} /> */}
        <Pricing padding="pt-[30vw]!" content={false} />
        <PricingCompareTable/>
        <PricingLicense/>
       <FAQs faqItems={faqItems}/>
        <CTA2 />
        <Footer />
      </VaultShell>
    </>
  );
}



const faqItems = [
  {
    id: "faq1",
    question: "How does billing work?",
    answer:
      "Pro is billed automatically to the card on file — monthly at $20/month, or annually at $179/year. You'll get a receipt by email each time you're charged, and you can update or remove your payment method at any time.",
  },
  {
    id: "faq2",
    question: "Can I switch between monthly and annual?",
    answer:
      "Yes. Switch to annual at any time and the change applies at your next billing date. Switching from annual to monthly takes effect at the end of your current annual term.",
  },
  {
    id: "faq3",
    question: "What happens if I cancel Pro?",
    answer:
      "Pro access continues until the end of the current billing period, then reverts to the free tier. Effects you've already installed stay in your repository — cancelling stops new Pro installs, it doesn't touch code you've already shipped.",
  },
  {
    id: "faq4",
    question: "Do you offer refunds?",
    answer:
      "If Pro isn't right for you, contact us within 7 days of a new subscription and we'll issue a refund. Outside that window, cancel anytime to stop future billing.",
  },
  {
    id: "faq5",
    question: "Can my team or agency use one license?",
    answer:
      "Pro is licensed per seat by default. If you need multi-seat or agency coverage, use agency licensing rather than sharing a single login — talk to Hyperiux and we'll scope it to your team size.",
  },
  {
    id: "faq6",
    question: "Do you offer agency or multi-seat pricing?",
    answer:
      "Yes. Agency licensing covers multiple seats and client projects under one agreement, with annual invoicing available — contact Hyperiux to scope it to your team size.",
  },
  {
    id: "faq7",
    question: "What happens to effects I've already installed if I downgrade?",
    answer:
      "Nothing changes in your codebase. Downgrading stops access to installing new Pro effects; source code you've already shipped keeps working exactly as it does today.",
  },
  {
    id: "faq8",
    question: "Do effects require GSAP, Three.js, Lenis, or other libraries?",
    answer:
      "Some do, some don't — every effect page lists its exact dependencies before you install, so you know the setup cost upfront. Scroll and text effects are often dependency-light; WebGL scenes typically require Three.js.",
  },
  {
    id: "faq9",
    question: "Is Vault compatible with the Next.js App Router?",
    answer:
      "Yes. Effects are built with the App Router in mind and documented for client-component boundaries. Pages Router projects are supported too, with setup notes on each effect page.",
  },
  {
    id: "faq10",
    question: "Do you offer discounts for students, nonprofits, or open-source projects?",
    answer:
      "We review student, nonprofit, and open-source discount requests case by case — email hi@hyperiux.com with a short description of your use case.",
  }

]
