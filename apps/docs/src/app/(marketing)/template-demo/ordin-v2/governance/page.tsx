// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import { ENQUIRE } from "../components/nav";
import PageReady from "../components/Animations/PageReady";
import { CtaOrb } from "../components/SignalOrb";
import PageHero from "../components/pages/PageHero";
import PolicyShield from "../components/pages/PolicyShield";
import PolicyGate from "../components/pages/PolicyGate";
import RunLog from "../components/pages/RunLog";
import FeatureGrid from "../components/pages/FeatureGrid";
import CodeShowcase from "../components/pages/CodeShowcase";
import Cta from "../components/Cta";
import { COMPLIANCE, POLICY_CODE } from "../components/pages/content";

export const metadata = pageMetadata(
  "Governance | Ordin",
  "Scoped permissions, spend ceilings, human sign-off, atomic runs and a signed audit trail for every AI agent action.",
  "/governance",
);

const page = () => {
  return (
    <main className="relative z-2 bg-ord-ink [clip-path:inset(0)]">
      <PageReady />
      <div aria-hidden className="ord-glow pointer-events-none fixed inset-0 z-0" />
      <CtaOrb />
      <PageHero
        orb="governance-hero"
        chapter="Governance"
        title={
          <>
            Agents improvise. <span className="text-ord-primary-light">Your rules don&apos;t.</span>
          </>
        }
        copy="Policies live on every action, not in a prompt. Anything that breaks one is denied before it runs, and every decision is signed and kept."
        primary={{ label: "Talk to security", href: ENQUIRE.security }}
        secondary={{ label: "Policies as code", href: "#governance-code" }}
        visual={<PolicyShield />}
        arc={{ flipX: true, flipY: true, speed: 0.5, flow: 0.6, softness: 1.3 }}
      />
      <PolicyGate />
      <RunLog />
      <FeatureGrid
        orb="governance-compliance"
        chapter="Compliance"
        heading={
          <>
            Ready for <span className="text-(--ord-text-muted)">your auditor.</span>
          </>
        }
        copy="The certifications, agreements and controls security teams ask for, in place before your first run."
        items={COMPLIANCE}
        tone="mist"
      />
      <CodeShowcase
        orb="governance-code"
        id="governance-code"
        chapter="Policies as code"
        heading={
          <>
            Policies as <span className="text-ord-stone">code.</span>
          </>
        }
        copy="Write your rules in one file, review them like any other change, and ship them with every deploy."
        points={["Versioned with your repo", "Reviewed in pull requests", "Tested before they ship"]}
        cta="Talk to security"
        ctaHref={ENQUIRE.security}
        file="ordin.policy.yaml"
        lang="YAML"
        code={POLICY_CODE}
        run={{ label: "3 policies applied", meta: "Checked in 4 ms per action" }}
      />
      <Cta />
    </main>
  );
};

export default page;
