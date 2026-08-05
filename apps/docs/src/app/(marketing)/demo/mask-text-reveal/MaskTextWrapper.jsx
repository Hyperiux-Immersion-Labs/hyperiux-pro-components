import React from "react";
import Image from "next/image";
import MaskTextReveal from "@/components/mask-text-reveal";
import SplitLine from "@/components/WebsiteComps/SplitLine";

const notes = [
  "Masked line splitting",
  "Scrubbed scroll timing",
  "Gradient edge reveal",
  "Responsive editorial type",
];

const frames = [
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg",
    label: "Chromatic sweep",
    className: "rotate-[-5deg] max-md:rotate-[-2deg]",
  },
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-08.jpg",
    label: "Liquid texture",
    className: "rotate-[4deg] translate-y-12 max-md:translate-y-0 max-md:rotate-[2deg]",
  },
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg",
    label: "Soft prism",
    className: "rotate-[-2deg] -translate-y-4 max-md:translate-y-0",
  },
];

const beats = [
  {
    kicker: "01 / Set the mood",
    title: "Use the mask as a spotlight, not a decoration.",
    body: "Each line enters like a poster being pulled from under studio light. The scroll controls the pace, so the viewer gets to conduct the reveal.",
  },
  {
    kicker: "02 / Shape the rhythm",
    title: "Short lines hit harder when the gradient has room to travel.",
    body: "The animation loves confident typography, broken phrases, and generous spacing. Let the words arrive in layers instead of explaining everything at once.",
  },
  {
    kicker: "03 / Finish loud",
    title: "Make the last reveal feel like a signature.",
    body: "Pair high contrast copy with textured imagery and let the masked text become the final frame of the composition.",
  },
];

const MaskTextWrapper = () => {
  return (
    
      <main className="overflow-hidden bg-[#f8f2df] text-[#111111]">
        <section className="relative min-h-screen px-8 py-8 max-md:px-4 max-md:py-4 pt-24 max-md:pt-24">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,17,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(17,17,17,0.06)_1px,transparent_1px)] bg-size-[72px_72px] max-md:bg-size-[38px_38px]" />

          <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-[1025px]:min-h-fit w-full max-w-7xl flex-col justify-between rounded-4xl border border-black/15 bg-[#f8f2df]/80 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur max-md:min-h-fit max-md:rounded-[1.25rem] max-md:p-4">
           

           <div className="grid items-end gap-8 py-10 grid-cols-[1.08fr_0.92fr] max-[1025px]:grid-cols-1 max-[1025px]:gap-7 max-[1025px]:py-9 max-md:gap-6 max-md:py-8">
  <MaskTextReveal scrub={false} className="w-full col-span-2 max-[1025px]:col-span-1">
    <h1 className="w-full max-w-6xl text-[clamp(3.5rem,8vw,8.5rem)] font-black uppercase leading-[0.82] text-[#111111] max-[1025px]:text-[clamp(3.2rem,9vw,6.5rem)] max-[1025px]:leading-[0.84] max-md:text-[3.25rem] max-md:leading-[0.86]">
      Pull the words from the noise.
    </h1>
  </MaskTextReveal>

  <div className="self-start">
    <div className="mt-10 flex flex-wrap gap-7 max-[1025px]:mt-5 max-md:mt-4 max-md:gap-2.5">
      {notes.map((note, index) => (
        <span
          key={note}
          className="border border-black w-[17vw] bg-[#f8f2df] px-4 py-2 text-sm font-black uppercase shadow-[5px_5px_0_#111111] max-[1025px]:px-3.5 max-[1025px]:py-1.5 max-[1025px]:text-[0.75rem] max-md:px-3 max-md:py-1.5 max-md:text-[0.62rem]"
          style={{
            transform: `rotate(${[-2, 1.5, -1, 2][index]}deg)`,
            backgroundColor: ["#f8f2df", "#d7ff48", "#ff6b4a", "#7dd3fc"][index],
          }}
        >
          {note}
        </span>
      ))}
    </div>
  </div>

  <div className="relative min-h-136 max-[1025px]:min-h-120 max-md:min-h-100">
    {frames.map(({ src, label, className }, index) => (
      <figure
        key={src}
        className={`absolute overflow-hidden border-2 border-black bg-white shadow-[12px_12px_0_#111111] ${className} ${
          index === 0
            ? "left-2 top-4 h-64 w-56 max-[1025px]:left-0 max-[1025px]:top-3 max-[1025px]:h-56 max-[1025px]:w-48 max-md:left-0 max-md:top-2 max-md:h-48 max-md:w-[48%]"
            : index === 1
              ? "right-0 top-20 h-72 w-64 max-[1025px]:top-20 max-[1025px]:h-64 max-[1025px]:w-56 max-md:right-0 max-md:top-20 max-md:h-52 max-md:w-[52%]"
              : "bottom-4 left-16 h-56 w-72 max-[1025px]:bottom-4 max-[1025px]:left-12 max-[1025px]:h-52 max-[1025px]:w-64 max-md:bottom-5 max-md:left-6 max-md:h-40 max-md:w-[72%]"
        }`}
      >
        <Image
          src={src}
          alt="asset-image"
          fill
          sizes="(max-width: 640px) 72vw, (max-width: 1024px) 56vw, 320px"
          className="object-cover"
        />
        <figcaption className="absolute bottom-3 left-3 bg-[#111111] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white max-[1025px]:px-2.5 max-[1025px]:py-1.5 max-[1025px]:text-[0.62rem] max-md:bottom-2 max-md:left-2 max-md:px-2 max-md:py-1 max-md:text-[0.52rem]">
          {label}
        </figcaption>
      </figure>
    ))}

    <div className="absolute bottom-14 right-6 grid h-24 w-24 place-items-center rounded-full border-2 border-black bg-[#d7ff48] px-2 text-center text-[0.65rem] font-black uppercase leading-tight shadow-[8px_8px_0_#111111] max-[1025px]:bottom-8 max-[1025px]:right-4 max-[1025px]:h-22 max-[1025px]:w-22 max-[1025px]:text-[0.58rem] max-md:bottom-0 max-md:right-2 max-md:h-20 max-md:w-20 max-md:text-[0.52rem]">
      line by line reveal
    </div>
  </div>
</div>
          </div>
        </section>

        <section className="relative px-8 py-28 max-md:px-4 max-md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 grid-cols-[0.82fr_1.18fr] max-[1025px]:grid-cols-1">
            <div className="sticky top-8 h-fit max-md:static">
              <p className="mb-5 inline-block border border-black bg-[#ff6b4a] px-4 py-2 text-xs font-black uppercase tracking-[0.26em] shadow-[5px_5px_0_#111111]">
                Creative use case
              </p>
              <MaskTextReveal scrub={true}>
                <h2 className="text-6xl font-black uppercase leading-[0.88] max-md:text-[3.25rem]">
                  Design the scroll like a mixtape.
                </h2>
              </MaskTextReveal>
            </div>

            <div className="space-y-8">
              {beats.map(({ kicker, title, body }, index) => (
                <article
                  key={kicker}
                  className={`border-2 border-black p-8 shadow-[10px_10px_0_#111111] max-md:p-5 ${
                    ["bg-white", "bg-[#7dd3fc]", "bg-[#111111] text-white"][index]
                  }`}
                >
                    <SplitLine>

                  <p className=" text-xs font-black uppercase tracking-[0.3em] max-md:mb-5 max-md:tracking-[0.18em]">
                    {kicker}
                  </p>
                    </SplitLine>
                  <MaskTextReveal scrub={true}>
                    <h3 className="text-5xl mt-8 mb-6 font-black uppercase leading-[0.95] max-md:text-[2.35rem]">
                      {title}
                    </h3>
                  </MaskTextReveal>
                  
                 
                    <SplitLine>

                  <p className={` max-w-2xl text-lg leading-[1.4] max-md:text-base max-md:leading-[1.2] ${index === 2 ? "text-white/75" : "text-black/70"}`}>
                    {body}
                  </p>
                    </SplitLine>
            
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative min-h-screen bg-[#111111] px-8 py-24 text-white max-md:px-4 max-md:py-16">
          <div className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-7xl items-center gap-10 grid-cols-[1fr_0.85fr] max-[1025px]:grid-cols-1 max-[1025px]:gap-2 max-md:gap-10 max-md:min-h-auto">
            <div>
              <div className="mb-8 flex flex-wrap gap-3">
                {["poster copy", "hero headlines", "launch pages", "story sections"].map((item) => (
                  <span
                    key={item}
                    className="border border-white/25 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white/80 max-md:text-[0.62rem]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <MaskTextReveal scrub={true}>
                <p className="text-[clamp(3.5rem,8vw,9rem)] max-[1025px]:text-[8vw] font-black uppercase leading-[0.86] text-white max-md:text-[3.35rem]">
                  Hide the sentence until the screen asks for it.
                </p>
              </MaskTextReveal>
            </div>

            <div className="relative overflow-hidden border-2 border-white/80 bg-[#f8f2df] p-4 text-[#111111] shadow-[14px_14px_0_#d7ff48] max-md:p-3">
              <Image
                src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg"
                alt="asset-image"
                width={3840}
                height={2160}
                sizes="(max-width: 640px) 100vw, 42vw"
                className="h-130 w-full object-cover saturate-150 max-md:h-72"
              />
              <div className="absolute left-7 top-7 max-w-64 bg-[#f8f2df] p-4 text-sm font-black uppercase leading-tight shadow-[6px_6px_0_#111111] max-md:left-5 max-md:top-5 max-md:max-w-48 max-md:text-[0.72rem]">
                A reveal animation for headlines that need drama without losing readability.
              </div>
            </div>
          </div>
        </section>
      </main>

  );
};

export default MaskTextWrapper;
