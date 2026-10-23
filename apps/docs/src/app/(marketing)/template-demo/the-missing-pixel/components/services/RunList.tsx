// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useState } from "react";
import { FadeUp, RuleDraw } from "../Animations/gsapAnim";
import SquareTranslate from "../effects/square-translate";

type Run = { title: string; text: string; time: string; on: number[] };

const RunList = ({ runs }: { runs: Run[] }) => {
  const [active, setActive] = useState(-1);

  return (
    <SquareTranslate onActiveChange={setActive}>
      <ol className="flex flex-col">
        {runs.map((run, index) => {
          const lit = active === index;
          return (
            <li key={run.title} data-row className="relative">
              <RuleDraw syncWithFade className="absolute inset-x-0 top-0 h-px bg-(--mpx-ink)/10" />
              {index === runs.length - 1 && (
                <RuleDraw syncWithFade className="absolute inset-x-0 bottom-0 h-px bg-(--mpx-ink)/10" />
              )}
              <FadeUp className="group grid grid-cols-12 items-center gap-x-9 gap-y-3 max-lg:gap-x-0 py-[3vw] max-lg:items-start max-lg:py-[5vw] max-md:py-[8vw]">
                <span
                  data-shift
                  className="col-span-1 self-start py-[0.5vw] text-14 text-mpx-muted max-lg:col-span-2"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3
                  data-shift
                  className={`col-span-4 text-40 transition-colors duration-700 ease-out group-hover:text-(color:--mpx-accent) max-lg:col-span-10 motion-reduce:transition-none ${
                    lit
                      ? "text-(color:--mpx-accent)"
                      : "text-mpx-muted max-lg:text-(color:--mpx-ink)"
                  }`}
                >
                  {run.title}
                </h3>
                <p className="col-span-4 col-start-6 text-24 leading-[1.3] text-mpx-muted max-lg:col-span-10 max-lg:col-start-3">
                  {run.text}
                </p>
                <div className="col-span-3 col-start-10 flex flex-col items-end gap-3 max-lg:col-span-10 max-lg:col-start-3 max-lg:items-start">
                  <span className="whitespace-nowrap text-14 text-(color:--mpx-ink)">
                    {run.time}
                  </span>
                  <span
                    aria-hidden
                    className="grid w-[14vw] grid-cols-12 gap-0.5 max-lg:w-[30vw] max-md:w-full"
                  >
                    {Array.from({ length: 12 }, (_, cell) => (
                      <i
                        key={cell}
                        className={`aspect-square rounded-xs transition-colors duration-500 motion-reduce:transition-none ${
                          run.on.includes(cell)
                            ? lit
                              ? "bg-(--mpx-ink)"
                              : "bg-(--mpx-ink)/30 group-hover:bg-(--mpx-ink)"
                            : "bg-mpx-surface"
                        }`}
                      />
                    ))}
                  </span>
                </div>
              </FadeUp>
            </li>
          );
        })}
      </ol>
    </SquareTranslate>
  );
};

export default RunList;
