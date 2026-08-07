"use client";
import OverflowStaggerText from "@/components/overflow-stagger-text";

const lines = [
  "Launch copy",
  "Section titles",
  "Editorial quotes",
  "Product drops",
];

const OverflowStaggerWrapper = ({ effectProps = {} }) => {
  const replayKey = JSON.stringify(effectProps);
  const replayProps = {
    ...effectProps,
    animateOnScroll: false,
    scrub: false,
  };

  return (
    <main className="flex h-screen overflow-hidden bg-[#f4efe6] text-[#151515]">
      <section className="flex h-full w-full items-center justify-center max-sm:px-4 max-sm:py-16">
        <div className="mx-auto flex h-full w-full items-center justify-center max-md:flex-col">
          <div className="flex h-full w-1/2 items-center justify-center px-[4vw] max-md:h-1/2 max-md:w-full">
            <OverflowStaggerText key={`left-${replayKey}`} {...replayProps}>
              <h2 className="text-7xl font-black uppercase leading-[0.9] max-sm:text-[12.9vw]">
                Use it where words need a first step.
              </h2>
            </OverflowStaggerText>
          </div>

          <div className="flex h-full w-1/2 items-center justify-center px-[4vw] max-md:h-1/2 max-md:w-full">
            <OverflowStaggerText key={`right-${replayKey}`} {...replayProps} className="w-full">
              <div className="w-full">
                {lines.map((line, index) => (
                  <div key={line}>
                    <p className="text-5xl font-black uppercase leading-none text-[#151515] max-sm:text-[10vw]">
                      {line}
                    </p>
                    {index < lines.length - 1 ? (
                      <div className="py-5 max-sm:py-4">
                        <div className="h-px w-full bg-[#151515]/15" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </OverflowStaggerText>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OverflowStaggerWrapper;
