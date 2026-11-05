// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import { ROUTES } from "../components/nav";
import PageReady from "../components/Animations/PageReady";
import { CtaOrb } from "../components/SignalOrb";
import PageHero from "../components/pages/PageHero";
import TraceViewer from "../components/pages/TraceViewer";
import Connectors from "../components/platform/Connectors";
import Tour from "../components/pages/Tour";
import FeatureGrid from "../components/pages/FeatureGrid";
import CodeShowcase from "../components/pages/CodeShowcase";
import Cta from "../components/Cta";
import { CAPABILITIES, CODE, LAYERS } from "../components/platform/content";

export const metadata = pageMetadata(
  "Platform | Ordin",
  "Six layers, one runtime: durable execution, scoped memory, typed tools, policies, evals and traces for production AI agents.",
  "/platform",
);

const page = () => {
  return (
    <main className="relative z-2 bg-ord-ink [clip-path:inset(0)]">
      <PageReady />
      <div aria-hidden className="ord-glow pointer-events-none fixed inset-0 z-0" />
      <CtaOrb />
      <PageHero
        orb="platform-hero"
        chapter="Platform"
        title={
          <>
            One runtime. <span className="text-ord-primary-light">Every agent.</span>
          </>
        }
        copy="Execution, memory, tools, policies, evals and traces in one platform, so a prototype agent and a production one run on exactly the same rails."
        primary={{ label: "Start building", href: ROUTES.pricing }}
        secondary={{ label: "See the SDK", href: "#platform-sdk" }}
        visual={<TraceViewer />}
        arc={{ flipY: true, speed: 0.7, flow: 0.7, softness: 1.35 }}
      />
      <Tour
        orb="platform-layers"
        chapter="Layers"
        label="Layer"
        heading={
          <>
            Inside the <span className="text-ord-stone">runtime.</span>
          </>
        }
        items={LAYERS}
        aside="tower"
      />
      <FeatureGrid
        orb="platform-capabilities"
        chapter="Capabilities"
        heading={
          <>
            Built in, <span className="text-(--ord-text-muted)">not bolted on.</span>
          </>
        }
        copy="The pieces every team ends up building around an LLM, shipped as one runtime and maintained for you."
        items={CAPABILITIES}
      />
      <Connectors />
      <CodeShowcase
        orb="platform-sdk"
        id="platform-sdk"
        chapter="SDK"
        heading={
          <>
            Ship an agent <span className="text-ord-stone">in twelve lines.</span>
          </>
        }
        copy="Describe the job, name the agents and the policies, set a budget. The runtime handles planning, retries, memory and the audit trail."
        points={["TypeScript and Python SDKs", "Runs locally against the real runtime", "Same code in staging and production"]}
        cta="See pricing"
        ctaHref={ROUTES.pricing}
        file="reconcile.ts"
        lang="TypeScript"
        code={CODE}
        run={{ label: "Run 8821 settled", meta: "4.2s / USD 0.031 / 0 errors" }}
      />
      <Cta />
    </main>
  );
};

export default page;
