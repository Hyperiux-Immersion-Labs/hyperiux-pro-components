"use client";

import { useState, type FormEvent } from "react";
import FlowerField from "@/components/flower-field";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

const range = (name: string, label: string, value: number, description: string, min: number, max: number, step: number, group = "motion", groupTitle = "Motion") => ({
  name,
  label,
  type: "number",
  default: value,
  description,
  remixer: { control: "range", group, groupTitle, min, max, step },
});

const FOOTER_LINKS = ["Legal", "Privacy", "Terms", "X"];

const ROLL_DELAYS = ["delay-0", "delay-[30ms]", "delay-[60ms]", "delay-[90ms]", "delay-[120ms]", "delay-[150ms]", "delay-[180ms]", "delay-[210ms]"];

function RollLetters({ text, className }: { text: string; className: string }) {
  return (
    <span aria-hidden="true" className="flex [grid-area:1/1] justify-center">
      {Array.from(text).map((letter, i) => (
        <span
          key={i}
          className={`inline-block transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] motion-reduce:transition-none ${ROLL_DELAYS[Math.min(i, ROLL_DELAYS.length - 1)]} ${className}`}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

function RollLabel({ from, to, rolled }: { from: string; to: string; rolled: boolean }) {
  return (
    <span className="relative grid overflow-hidden">
      <span className="sr-only">{rolled ? to : from}</span>
      <span aria-hidden="true" className="invisible [grid-area:1/1]">
        {from.length > to.length ? from : to}
      </span>
      <RollLetters text={from} className={rolled ? "-translate-y-full" : "translate-y-0"} />
      <RollLetters text={to} className={rolled ? "translate-y-0" : "translate-y-full"} />
    </span>
  );
}

function MeadowFooter() {
  const [joined, setJoined] = useState(false);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setJoined(true);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-[58%] flex-col items-center justify-center gap-[3vw] px-6 text-center max-[1025px]:h-[55%] max-[1025px]:gap-[5vw] max-md:h-[60%] max-md:gap-[8vw]">
      <h2 className="font-serif! text-[3.2vw] leading-[1.1] text-white max-[1025px]:text-[5.5vw] max-md:text-[9vw]">
        Something new
        <br />
        is in full bloom.
      </h2>
      <form
        onSubmit={onSubmit}
        className="pointer-events-auto flex w-[24vw] items-center gap-[0.4vw] rounded-[0.7vw] border border-white/15 bg-white/5 p-[0.3vw] backdrop-blur-sm max-[1025px]:w-[46vw] max-[1025px]:gap-[0.8vw] max-[1025px]:rounded-[1.2vw] max-[1025px]:p-[0.6vw] max-md:w-[84vw] max-md:gap-[1.5vw] max-md:rounded-[2.5vw] max-md:p-[1.2vw]"
      >
        <input
          type="email"
          required
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          className="w-full bg-transparent px-[1vw] text-[0.9vw] text-white caret-white outline-none placeholder:text-white/40 selection:bg-[#4a7dff]/60! selection:text-white! [--input-autofill-bg:transparent] [--input-autofill-text:#fff] max-[1025px]:px-[2vw] max-[1025px]:text-[1.8vw] max-md:px-[3vw] max-md:text-[3.8vw]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[0.5vw] bg-[#4a7dff] px-[2.4vw] py-[0.6vw] text-[0.9vw] text-white transition-colors hover:bg-[#3a6cf0] max-[1025px]:rounded-[0.9vw] max-[1025px]:px-[4vw] max-[1025px]:py-[1.2vw] max-[1025px]:text-[1.8vw] max-md:rounded-[1.8vw] max-md:px-[6vw] max-md:py-[2.6vw] max-md:text-[3.8vw]"
        >
          <RollLabel from="Apply" to="Applied" rolled={joined} />
        </button>
      </form>
      <div className="flex flex-col items-center gap-[1.2vw] max-[1025px]:gap-[2.4vw] max-md:gap-[4vw]">
        <p className="font-serif text-[1.1vw] text-white/50 max-[1025px]:text-[2.2vw] max-md:text-[4.2vw]">
          grown slowly, one petal at a <span className="text-white/90">time</span>
        </p>
        <nav className="pointer-events-auto flex gap-[1.4vw] max-[1025px]:gap-[2.8vw] max-md:gap-[5vw]">
          {FOOTER_LINKS.map((label) => (
            <a
              key={label}
              href="#"
              className="font-serif text-[1.1vw] text-white/50 transition-colors hover:text-white max-[1025px]:text-[2.2vw] max-md:text-[4.2vw]"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="flower-field"
      category="backgrounds"
      component={FlowerField}
      props={[
        range("follow", "Follow", 1, "How strongly the pointer blows the flowers away from it, like a gust of air. 0 leaves them be.", 0, 3, 0.05, "cursor", "Cursor"),
        range("followRadius", "Reach", 1.3, "Reach of the pointer, in world units.", 0.4, 3, 0.05, "cursor", "Cursor"),
        {
          name: "bloomOnHover",
          label: "Bloom on hover",
          type: "boolean",
          default: true,
          description: "Open buds as the pointer passes over them.",
          remixer: { control: "checkbox", group: "cursor", groupTitle: "Cursor" },
        },
        range("speed", "Speed", 1, "How quickly the flowers open, and how springy their stems are.", 0.3, 3, 0.05),
        range("breeze", "Breeze", 1, "How much the breeze sways the flowers. 0 holds them still.", 0, 3, 0.05),
        range("density", "Density", 1, "How many flowers and buds grow across the frame. 1 is the reference meadow.", 0.4, 2, 0.05, "look", "Look"),
        range("glow", "Glow", 1, "Strength of the glow around the flowers.", 0, 2.5, 0.05, "look", "Look"),
        range("depthOfField", "Depth of field", 1, "How blurred the flowers in front of and behind the focus are. 0 keeps everything sharp.", 0, 2.5, 0.05, "look", "Look"),
        range("mist", "Mist", 1, "Strength of the mist along the ground.", 0, 2, 0.05, "look", "Look"),
        range("grain", "Grain", 0.05, "Film grain strength. 0 turns it off.", 0, 0.3, 0.01, "look", "Look"),
      ]}
    >
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The meadow holds still.",
              body: "With reduced motion, Flower Field shows the meadow already in bloom as one still frame: the flowers stay open and still, and the pointer no longer moves them. Setting changes still apply.",
            }}
          />
          <main className="relative h-screen w-full">
            <footer className="relative h-full w-full">
              {effect}
              <MeadowFooter />
            </footer>
          </main>
        </>
      )}
    </LocalRemixerDemo>
  );
}
