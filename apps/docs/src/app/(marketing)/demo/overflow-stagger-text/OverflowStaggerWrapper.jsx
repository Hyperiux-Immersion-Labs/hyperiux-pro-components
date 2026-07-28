"use client";
import { useState } from "react";
import Image from "next/image";
import OverflowStaggerText from "@/components/overflow-stagger-text";
import SplitLine from "@/components/WebsiteComps/SplitLine";

const details = [
  { label: "Split", value: "characters" },
  { label: "Motion", value: "up + rotate" },
  { label: "Trigger", value: "scroll scrub" },
];

const lines = [
  "Launch copy",
  "Section titles",
  "Editorial quotes",
  "Product drops",
];

const notes = [
  "Characters start below the visible line.",
  "Overflow clipping keeps the reveal clean.",
  "A small stagger turns text into rhythm.",
];

const OverflowStaggerWrapper = ({ effectProps = {} }) => {
  const [replayKey, setReplayKey] = useState(0);

  return (
      <main key={replayKey} className="overflow-hidden bg-[#f4efe6] text-[#151515]">
        <section className=" px-8 py-8 pt-22 max-md:pt-25 max-sm:pt-22 max-sm:px-4 max-md:py-18 max-sm:py-4">
          <div className="mx-auto grid  max-w-7xl grid-rows-[auto_1fr_auto] border border-[#151515]/15 bg-[#fbf8f1] max-sm:min-h-[calc(100vh-2rem)]">
           

            <div className="grid gap-10 px-6 py-14 grid-cols-[1.08fr_0.92fr] max-md:grid-cols-1 max-sm:px-4 max-sm:py-10">
              <div className="flex flex-col gap-[2vw] max-sm:gap-[4vw]">
                <OverflowStaggerText key={`hero-title-${replayKey}`} scrub={false} start="top bottom" {...effectProps}>
                  <h1 className=" text-[7vw] uppercase leading-[0.82] tracking-normal text-[#151515] max-md:text-[10vw] max-sm:text-[15vw] max-sm:leading-[0.86]">
                    Text that steps into frame.
                  </h1>
                </OverflowStaggerText>
                <button
                  onClick={() => setReplayKey((value) => value + 1)}
                  className="w-fit cursor-pointer rounded-full bg-black px-[1.5vw] py-[1vw] text-white leading-none max-sm:px-[7vw] max-sm:py-[4vw] max-md:px-[3vw] max-md:py-[2vw]"
                >
                  Replay The Animation
                </button>
              </div>

              <div className="grid gap-6">
                <div className="relative size-[30vw]  overflow-hidden bg-[#dbeafe] max-md:size-[85vw]">
                  <Image
                    src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-01.jpg"
                    alt="asset-image"
                    fill
                    priority
                    sizes=""
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-[#151515] px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#fbf8f1] max-sm:text-[2.8vw]">
                    Overflow hidden / characters visible
                  </div>
                </div>
                <OverflowStaggerText
                  key={`hero-copy-${replayKey}`}
                  scrub={false}
                  start="top bottom"
                  stagger={0.008}
                  {...effectProps}
                >
                  <p className="max-w-md text-lg leading-8 text-[#151515]/68 max-sm:text-base max-sm:leading-7">
                    A clean text reveal where each character rises from a
                    clipped line with a tiny rotation. It feels playful, but the
                    layout stays calm.
                  </p>
                </OverflowStaggerText>
              </div>
            </div>

            <div className="grid border-t border-[#151515]/15 grid-cols-3 max-sm:grid-cols-1">
              {details.map(({ label, value }) => (
                <div
                  key={label}
                  className="border-[#151515]/15 px-6 py-5 max-sm:px-4 border-r last:border-r-0 max-sm:border-r-0"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#151515]/45 max-sm:tracking-[0.16em]">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-black uppercase max-sm:text-lg">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 py-24 max-sm:px-4 max-sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 grid-cols-[0.8fr_1.2fr] max-md:grid-cols-1">
            <div>
              <OverflowStaggerText scrub={true}>
                <h2 className="text-6xl font-black uppercase leading-[0.9] max-sm:text-[12.9vw]">
                  Use it where words need a first step.
                </h2>
              </OverflowStaggerText>
            </div>

            <div className="grid gap-3">
              {lines.map((line) => (
                <OverflowStaggerText key={line} scrub={true}>
                  <p className="border-b border-[#151515]/15 py-5 text-5xl font-black uppercase leading-none text-[#151515] max-sm:py-4 max-sm:text-[10vw]">
                    {line}
                  </p>
                </OverflowStaggerText>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#151515] px-8 py-24 text-[#fbf8f1] max-sm:px-4 max-sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 grid-cols-[1.15fr_0.85fr] max-md:grid-cols-1">
            <div className="relative min-h-130 overflow-hidden max-sm:min-h-80">
              <Image
                src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg"
                alt="asset-image"
                fill
                sizes="(max-width: 640px) 100vw, 54vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#151515]/20" />
            </div>

            <div className="flex flex-col justify-between gap-12">
              <OverflowStaggerText scrub={true} start="top 80%" end="bottom 80%">
                <h2 className="text-6xl font-black uppercase leading-[0.9] max-sm:text-[12.7vw]">
                  Simple setup, expressive entrance.
                </h2>
              </OverflowStaggerText>

              <div className="space-y-5">
                {notes.map((note, index) => (
                  <div
                    key={note}
                    className="border-t border-white/20 pt-5 text-lg leading-8 text-white/70 max-sm:text-base max-md:text-xl max-sm:leading-7"
                  >
                    <SplitLine>

                    <span className="mr-4 font-black text-[#f8d84a]">
                      0{index + 1}
                    </span>
                    {note}
                    </SplitLine>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
       
      </main>
  
  );
};

export default OverflowStaggerWrapper;
