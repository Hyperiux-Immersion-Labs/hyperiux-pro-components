// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import { ENQUIRE, ROUTES } from "../components/nav";
import PageReady from "../components/Animations/PageReady";
import { CtaOrb } from "../components/SignalOrb";
import PageHero from "../components/pages/PageHero";
import AgentGraph from "../components/pages/AgentGraph";
import RelayTrack from "../components/pages/RelayTrack";
import TaskStream from "../components/pages/TaskStream";
import AgentChat from "../components/pages/AgentChat";
import FeatureGrid from "../components/pages/FeatureGrid";
import CodeShowcase from "../components/pages/CodeShowcase";
import Cta from "../components/Cta";
import { AGENT_CODE, AGENT_FEATURES } from "../components/pages/content";

export const metadata = pageMetadata(
  "Agents | Ordin",
  "Six specialist agents that plan, research, analyse, code, check and deliver, coordinated by one runtime with shared memory.",
  "/agents",
);

const page = () => {
  return (
    <main className="relative z-2 bg-ord-ink [clip-path:inset(0)]">
      <PageReady />
      <div aria-hidden className="ord-glow pointer-events-none fixed inset-0 z-0" />
      <CtaOrb />
      <PageHero
        orb="agents-hero"
        chapter="Agents"
        title={
          <>
            Specialists that <span className="text-ord-primary-light">work like a team.</span>
          </>
        }
        copy="Ordin wakes only the agents a job needs, hands each a scoped brief and keeps them in one shared memory, so the work moves like a well-run team."
        primary={{ label: "Start building", href: ROUTES.pricing }}
        secondary={{ label: "Build your own", href: "#agents-custom" }}
        visual={<AgentGraph />}
        arc={{ flipX: true, speed: 1.2, flow: 1.1, softness: 1.15 }}
      />
      <TaskStream />
      <RelayTrack />
      <AgentChat />
      <FeatureGrid
        orb="agents-coordination"
        chapter="Coordination"
        heading={
          <>
            Coordination, <span className="text-(--ord-text-muted)">handled.</span>
          </>
        }
        copy="Handoffs, memory, models and budgets are the runtime's job, so your agents can stay focused on theirs."
        items={AGENT_FEATURES}
      />
      <CodeShowcase
        orb="agents-custom"
        id="agents-custom"
        chapter="Custom agents"
        heading={
          <>
            Define your own <span className="text-ord-stone">specialist.</span>
          </>
        }
        copy="A brief, a model, the tools it may touch and the policies it must follow. That is a whole agent, and it joins the team like any other."
        points={["Any model with an API", "Scoped tools and memory", "Policies travel with it"]}
        cta="Talk to an engineer"
        ctaHref={ENQUIRE.demo}
        file="auditor.ts"
        lang="TypeScript"
        code={AGENT_CODE}
        run={{ label: "Agent auditor registered", meta: "3 tools / 2 policies / USD 0.02 cap" }}
      />
      <Cta />
    </main>
  );
};

export default page;
