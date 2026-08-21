import DitherTransition from "@/components/dither-transition";

const SectionLabel = ({
  eyebrow,
  title,
  body,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  dark?: boolean;
}) => {
  return (
    <div className="mx-auto flex min-h-[72vh] w-full max-w-6xl flex-col justify-center px-6 py-24 md:min-h-screen md:px-10">
      <p
        className={`mb-6 text-xs font-medium uppercase ${
          dark ? "text-white/50" : "text-black/45"
        }`}
      >
        {eyebrow}
      </p>
      <h1
        className={`max-w-4xl text-6xl font-semibold leading-[0.92] md:text-8xl ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {title}
      </h1>
      <p
        className={`mt-8 max-w-2xl text-lg leading-7 md:text-xl ${
          dark ? "text-white/64" : "text-black/60"
        }`}
      >
        {body}
      </p>
    </div>
  );
};

export default function DitherTransitionDemoPage() {
  return (
    <main className="bg-background">
      <section className="bg-background">
        <SectionLabel
          eyebrow="Use cases"
          title="Light section before pricing"
          body="This mirrors the homepage area before the dark pricing block begins."
        />
      </section>

      <DitherTransition
        markers={false}
        mobileStartTriggers="-10% bottom"
        mobileEndTriggers="bottom -50%"
        className="h-[60vw] max-md:m max-md:h-[150vw]! bg-background "
      />

      <section className="bg-foreground">
        <SectionLabel
          dark
          eyebrow="Pricing"
          title="Dark section carried by the dither"
          body="The black section arrives through the same ordered grain transition used on the homepage."
        />
      </section>

      <DitherTransition
        dotColor="#050505"
        accentShift={0.8}
        start="top bottom"
        end="150% top"
        mobileStartTriggers="top bottom"
        mobileEndTriggers="bottom -50%"
        markers={false}
        accentColor="#eaeaea"
        className="h-[75vw] max-md:h-[150vw]! mt-[-10vw] bg-foreground"
      />

      <section className="bg-background">
        <SectionLabel
          eyebrow="FAQ"
          title="Light section after pricing"
          body="The outgoing black dissolves exactly like the homepage handoff into FAQ."
        />
      </section>
    </main>
  );
}
