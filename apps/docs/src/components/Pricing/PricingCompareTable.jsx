"use client";

import React from "react";
import RandomBlur from "../WebsiteComps/RandomBlur";
import SplitLine from "../WebsiteComps/SplitLine";

const rows = [
  { feature: "Effects included", free: "30+ effects", pro: "Full library, all categories", proHighlight: true },
  { feature: "New effects", free: null, pro: "Added monthly", proHighlight: true },
  { feature: "Scroll & text effects", free: true, pro: true },
  { feature: "Cursor effects", free: false, pro: true },
  { feature: "WebGL scenes", free: false, pro: true },
  { feature: "Advanced page transitions", free: false, pro: true },
  { feature: "CLI install", free: true, pro: true },
  { feature: "Source code ownership", free: true, pro: true },
  { feature: "Commercial use", free: "Free core, where marked", pro: "Full commercial use", proHighlight: true },
  { feature: "Updates & fixes", free: "Community cadence", pro: "Priority", proHighlight: true },
  { feature: "Support", free: "GitHub / community", pro: "Email support", proHighlight: true },
  { feature: "Team / agency use", free: "Individual use", pro: "Per seat — agency licensing available", proHighlight: true },
  { feature: "Price", free: "$0 forever", pro: "$20/mo or $179/yr", proHighlight: true },
];

function Tick() {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      className="w-[1.1vw] h-[1.1vw] max-md:w-4 max-md:h-4 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M3.5 9.4L7.2 13L14.8 4.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dash() {
  return <span className="text-white/25 text-[1.1vw] max-md:text-base">—</span>;
}

function Cell({ value, highlight = false }) {
  if (value === true) return <span className="text-white"><Tick /></span>;
  if (!value) return <Dash />;
  return (
    <span className={`text24 max-md:text-[3.5vw] max-sm:text-sm leading-snug ${highlight ? "text-[#ff5f00] font-medium" : "text-white/50"}`}>
      {value}
    </span>
  );
}

export default function PricingCompareTable() {
  return (
    <section className="w-screen overflow-hidden bg-[#0e0e0e] text-white px-[5vw] py-[8vw] max-md:px-[0vw] max-md:py-[16vw]">

      {/* Heading */}
      <RandomBlur
        as="h2"
        className="text110 text-center mb-[6vw] max-md:mb-[12vw] w-[75vw] max-md:w-full mx-auto"
      >
        Free vs. Pro, feature by feature.
      </RandomBlur>

      {/* Table card */}
      <div className="w-full h-fit max-md:overflow-x-scroll max-md:pb-[7vw] max-md:px-[7vw] fadeup">
        <div className="mx-auto w-full max-w-[82vw]  rounded-lg border border-white/8 overflow-hidden  max-sm:max-w-[240vw] max-sm:w-[240vw] max-md:max-w-[150vw] max-md:w-[150vw]">

          {/* Column headers */}
          <div className="grid grid-cols-[2.2fr_1fr_1fr] max-md:grid-cols-[25%_40%_35%] max-sm:grid-cols-[25%_40%_35%] bg-white/[0.04] px-[2.5vw] py-[1.3vw] max-md:px-6 max-md:py-4 border-b border-white/8">
            <span className=" text-[1.2vw] max-md:text-[3vw] max-sm:text-[5vw] text-white/50 uppercase">
              Feature
            </span>
            <span className=" text-[1.2vw] max-md:text-[3vw] max-sm:text-[5vw] text-white/50 uppercase text-center">
              Free
            </span>
            <span className=" text-[1.2vw] max-md:text-[3vw] max-sm:text-[5vw] text-white/50 uppercase text-center">
              Pro
            </span>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[2.2fr_1fr_1fr] max-md:grid-cols-[25%_40%_35%] max-sm:grid-cols-[25%_40%_35%] items-center px-[2.5vw] py-[1.4vw] max-md:px-6 max-md:py-4 border-t border-white/6 ${i % 2 !== 0 ? "bg-white/[0.02]" : ""
                }`}
            >
              <span className="text24 max-md:text-sm text-white/80 pr-[2vw]">
                {row.feature}
              </span>
              <span className="flex items-center justify-center">
                <Cell value={row.free} />
              </span>
              <span className="flex items-center justify-center text-center">
                <Cell value={row.pro} highlight={row.proHighlight} />
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Footer note */}
      <SplitLine
        as="p"
        className="text24 max-md:text-sm text-center mt-[3vw] max-md:mt-[8vw]"
      >
        All plans include source code you own. No black boxes.
      </SplitLine>
    </section>
  );
}
