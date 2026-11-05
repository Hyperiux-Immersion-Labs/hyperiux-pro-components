// Built using Hyperiux Vault: https://vault.hyperiux.com
import PageReady from "./components/Animations/PageReady";
import DocumentTitle from "./components/Animations/DocumentTitle";
import { OrdButton } from "./components/Buttons";
import MintArc from "./components/MintArc";
import { ENQUIRE, ROUTES } from "./components/nav";

// The 404: a run that went nowhere, settled with a way back
const NotFound = () => (
  <main className="relative z-2 bg-ord-ink [clip-path:inset(0)]">
    <PageReady />
    <DocumentTitle title="Page not found | Ordin" />
    <div aria-hidden className="ord-glow pointer-events-none fixed inset-0 z-0" />
    <section data-ord-orb="not-found" data-ord-chapter="Not found" className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden ord-container text-center max-md:gap-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-80 [mask-image:radial-gradient(circle_at_50%_55%,#000_30%,transparent_75%)]">
        <MintArc flipX flipY speed={0.6} flow={0.8} softness={1.4} />
      </div>
      <span className="relative z-1 ord-label text-14 uppercase text-ord-stone">Run 404 / no route</span>
      <h1 className="relative z-1 text-[16vw] leading-[0.85] tracking-[-0.06em] text-ord-primary-light max-md:text-[34vw]">404</h1>
      <p className="relative z-1 w-[36%] text-28 text-ord-ash max-lg:w-[70%] max-md:w-full">
        This page doesn&apos;t exist. The run was rolled back and nothing was changed.
      </p>
      <div className="relative z-1 flex flex-wrap justify-center gap-3">
        <OrdButton href={ROUTES.home}>Back to home</OrdButton>
        <OrdButton href={ENQUIRE.demo} variant="line">
          Talk to the team
        </OrdButton>
      </div>
    </section>
  </main>
);

export default NotFound;
