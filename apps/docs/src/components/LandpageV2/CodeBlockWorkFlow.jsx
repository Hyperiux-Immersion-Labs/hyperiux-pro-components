"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function WindowDots() {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2.5 rounded-full bg-white/70" />
      <span className="size-2.5 rounded-full bg-white/70" />
      <span className="size-2.5 rounded-full bg-white/70" />
    </div>
  );
}

function TerminalTick({ tickRef }) {
  return (
    <svg
      ref={tickRef}
      viewBox="0 0 18 18"
      className="h-[1.05vw] w-[1.05vw] shrink-0 text-[#35c58b] opacity-0 max-md:h-4 max-md:w-4"
      fill="none"
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

function Panel({ title, children, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-[1.6vw] border border-white/8 bg-[#0b0b0d] shadow-[0_20px_80px_rgba(0,0,0,0.35)] max-md:rounded-[4vw] ${className}`}
    >
      <div className="flex h-[3vw] items-center gap-[1vw] bg-[linear-gradient(90deg,rgba(255,255,255,0.11),rgba(255,255,255,0.06))] px-[1.4vw] max-md:h-12 max-md:px-5">
        <WindowDots />

        <p className="font-mono text-[1.02vw] text-white/72 max-md:text-sm">
          {title}
        </p>
      </div>

      <div className="p-[1.6vw] max-md:p-5">{children}</div>
    </div>
  );
}

function TreeFolder({ label, depth = 0 }) {
  return (
    <div
      className="flex items-center gap-3 text-white/80"
      style={{ paddingLeft: `${depth * 1.35}vw` }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[1.1vw] w-[1.1vw] shrink-0 text-[#3b82f6] max-md:h-4 max-md:w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
      </svg>

      <span className="font-mono text-[1.05vw] max-md:text-[15px]">
        {label}
      </span>
    </div>
  );
}

function TreeFile({ label, depth = 0, className = "", right = null, rowRef }) {
  return (
    <div
      ref={rowRef}
      className={`flex items-center justify-between rounded-[0.3vw] px-[0.55vw] py-[0.35vw] opacity-0 max-md:rounded-md max-md:px-2 max-md:py-1.5 ${className}`}
      style={{ paddingLeft: `calc(${depth * 1.35}vw + 0.55vw)` }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <svg
          viewBox="0 0 24 24"
          className="h-[1.05vw] w-[1.05vw] shrink-0 text-[#c084fc] max-md:h-4 max-md:w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M7 3.75h6l4 4v12.5H7A1.25 1.25 0 0 1 5.75 19V5A1.25 1.25 0 0 1 7 3.75z" />
          <path d="M13 3.75V8h4.25" />
        </svg>

        <span className="truncate font-mono text-[1.05vw] text-[#ff7a1a] max-md:text-[15px]">
          {label}
        </span>
      </div>

      {right}
    </div>
  );
}

export default function CodeBlockWorkflow() {
  const sectionRef = useRef(null);

  const terminalRefs = useRef({});
  const codeRefs = useRef({});
  const fileRefs = useRef({});
  const tickRefs = useRef({});

  const masterTlRef = useRef(null);

  const setTerminalRef = (key) => (el) => {
    terminalRefs.current[key] = el;
  };

  const setCodeRef = (key) => (el) => {
    codeRefs.current[key] = el;
  };

  const setFileRef = (key) => (el) => {
    fileRefs.current[key] = el;
  };

  const setTickRef = (key) => (el) => {
    tickRefs.current[key] = el;
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const allFileRows = [
        fileRefs.current.scrollStackRow,
        fileRefs.current.useLenisRow,
        fileRefs.current.reducedMotionRow,
      ].filter(Boolean);

      const allCodeLines = [
        codeRefs.current.line1,
        codeRefs.current.line2,
        codeRefs.current.line3,
        codeRefs.current.line4,
        codeRefs.current.line5,
      ].filter(Boolean);

      const allTicks = Object.values(tickRefs.current).filter(Boolean);

      const clearTypedContent = () => {
        Object.values(terminalRefs.current).forEach((el) => {
          if (el) el.textContent = "";
        });

        Object.values(codeRefs.current).forEach((el) => {
          if (el) el.textContent = "";
        });
      };

      const resetState = () => {
        clearTypedContent();

        gsap.set(allFileRows, {
          autoAlpha: 0,
          y: 10,
          backgroundColor: "rgba(255,255,255,0)",
        });

        gsap.set(allCodeLines, {
          autoAlpha: 0.22,
        });

        const allBadges = [
          fileRefs.current.addedBadge1,
          fileRefs.current.addedBadge2,
          fileRefs.current.addedBadge3,
        ].filter(Boolean);

        gsap.set(allBadges, {
          autoAlpha: 0,
          x: -8,
        });

        gsap.set(terminalRefs.current.doneCursor, {
          autoAlpha: 0,
        });

        allTicks.forEach((tick) => {
          const path = tick.querySelector("path");

          gsap.set(tick, {
            autoAlpha: 0,
            scale: 0.86,
          });

          if (path) {
            const length = path.getTotalLength();

            gsap.set(path, {
              strokeDasharray: length,
              strokeDashoffset: length,
            });
          }
        });
      };

      const typeText = (timeline, element, text, duration = null, position) => {
        if (!element) return;

        const chars = text.length;
        const state = { count: 0 };
        const finalDuration = duration ?? Math.max(0.3, chars * 0.02);

        timeline.set(
          element,
          {
            textContent: "",
            autoAlpha: 1,
          },
          position
        );

        timeline.to(
          state,
          {
            count: chars,
            duration: finalDuration,
            ease: "none",
            snap: { count: 1 },
            onUpdate: () => {
              element.textContent = text.slice(0, state.count);
            },
          },
          position
        );
      };

      const drawTick = (timeline, tickEl, position) => {
        if (!tickEl) return;

        const path = tickEl.querySelector("path");
        if (!path) return;

        const length = path.getTotalLength();

        timeline.set(
          path,
          {
            strokeDasharray: length,
            strokeDashoffset: length,
          },
          position
        );

        timeline.to(
          tickEl,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.12,
            ease: "power2.out",
          },
          position
        );

        timeline.to(
          path,
          {
            strokeDashoffset: 0,
            duration: 0.2,
            ease: "power2.out",
          },
          position
        );
      };

      const typeSuccessLine = (
        timeline,
        tickEl,
        textEl,
        text,
        position,
        duration = null
      ) => {
        drawTick(timeline, tickEl, position);
        typeText(timeline, textEl, text, duration, `${position}+=0.06`);
      };

      const flashAddedRow = (timeline, rowEl, position) => {
        if (!rowEl) return;

        timeline.fromTo(
          rowEl,
          {
            autoAlpha: 0,
            y: 10,
            backgroundColor: "rgba(34,197,94,0)",
          },
          {
            autoAlpha: 1,
            y: 0,
            backgroundColor: "rgba(34,197,94,0.24)",
            duration: 0.2,
            ease: "power2.out",
          },
          position
        );

        timeline.to(
          rowEl,
          {
            backgroundColor: "rgba(255,255,255,0)",
            duration: 0.3,
            ease: "power2.out",
          },
          ">-0.02"
        );
      };

      const revealCodeLine = (timeline, lineEl, text, position) => {
        if (!lineEl) return;

        timeline.to(
          lineEl,
          {
            autoAlpha: 1,
            duration: 0.05,
          },
          position
        );

        typeText(
          timeline,
          lineEl,
          text,
          Math.max(0.2, text.length * 0.015),
          position
        );
      };

      const buildSequence = () => {
        resetState();

        const tl = gsap.timeline({
          paused: true,
        });

        typeText(tl, terminalRefs.current.init, "npx hyperiux init");

        typeSuccessLine(
          tl,
          tickRefs.current.created,
          terminalRefs.current.created,
          "created hyperiux.config.js",
          "+=0.05"
        );

        typeText(
          tl,
          terminalRefs.current.add,
          "npx hyperiux add scroll-stack",
          null,
          "+=0.08"
        );

        typeText(
          tl,
          terminalRefs.current.resolving,
          "resolving dependencies: gsap, Lenis",
          null,
          "+=0.04"
        );

        flashAddedRow(tl, fileRefs.current.scrollStackRow, "+=0.05");
        tl.to(
          fileRefs.current.addedBadge1,
          { autoAlpha: 1, x: 0, duration: 0.15, ease: "power2.out" },
          "<+0.05"
        );

        flashAddedRow(tl, fileRefs.current.useLenisRow, "+=0.04");
        tl.to(
          fileRefs.current.addedBadge2,
          { autoAlpha: 1, x: 0, duration: 0.15, ease: "power2.out" },
          "<+0.05"
        );

        flashAddedRow(tl, fileRefs.current.reducedMotionRow, "+=0.04");
        tl.to(
          fileRefs.current.addedBadge3,
          { autoAlpha: 1, x: 0, duration: 0.15, ease: "power2.out" },
          "<+0.05"
        );

        typeSuccessLine(
          tl,
          tickRefs.current.added,
          terminalRefs.current.added,
          "added 3 files to /components/hyperiux",
          "<+0.02"
        );

        typeText(
          tl,
          terminalRefs.current.reduced,
          "reduced-motion fallback included",
          null,
          "+=0.05"
        );

        typeSuccessLine(
          tl,
          tickRefs.current.done,
          terminalRefs.current.done,
          "done - own the code.",
          "+=0.04"
        );

        tl.to(
          terminalRefs.current.doneCursor,
          {
            autoAlpha: 1,
            duration: 0.08,
          },
          "<+0.05"
        );

        tl.to(
          terminalRefs.current.doneCursor,
          {
            autoAlpha: 0.35,
            repeat: 5,
            yoyo: true,
            duration: 0.25,
            ease: "none",
          },
          ">"
        );

        revealCodeLine(
          tl,
          codeRefs.current.line1,
          `import ScrollStack from "@/components/hyperiux/scroll-stack";`,
          "+=0.05"
        );

        revealCodeLine(tl, codeRefs.current.line2, "", "+=0.02");

        revealCodeLine(
          tl,
          codeRefs.current.line3,
          "export default function Page() {",
          "+=0.02"
        );

        revealCodeLine(
          tl,
          codeRefs.current.line4,
          "  return <ScrollStack />;",
          "+=0.02"
        );

        revealCodeLine(tl, codeRefs.current.line5, "}", "+=0.02");

        return tl;
      };

      const playSequence = () => {
        masterTlRef.current?.kill();
        masterTlRef.current = buildSequence();
        masterTlRef.current.play(0);
      };

      resetState();

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 68%",
        once: true,
        onEnter: () => {
          playSequence();
        }
      });

      return () => {
        trigger.kill();
      };
    }, section);

    return () => {
      masterTlRef.current?.kill();
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="code-block"
      ref={sectionRef}
      className="relative w-full overflow-hidden text-white max-md:px-0 max-md:py-20 max-sm:py-0 max-sm:pb-8"
    >
      <div className="mx-auto w-full max-w-[1800px]">
        <div className="grid grid-cols-[0.92fr_1.08fr] gap-[1.4vw] max-md:grid-cols-1 max-md:gap-5">
          <div className="flex flex-col gap-[1.4vw] max-md:contents">
            <Panel title="amazing_project" className="min-h-[25vw]">
              <div className="space-y-[0.8vw] font-mono text-[1.02vw] leading-[1.9] max-md:space-y-2 max-md:text-[14px]">
                <div className="flex items-center gap-2">
                  <span className="text-[#ff9f43]">$</span>
                  <span ref={setTerminalRef("init")} className="text-white/90" />
                </div>

                <div className="flex items-center gap-2">
                  <TerminalTick tickRef={setTickRef("created")} />
                  <span
                    ref={setTerminalRef("created")}
                    className="text-[#35c58b]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#ff9f43]">$</span>
                  <span ref={setTerminalRef("add")} className="text-white/90" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white/0">•</span>
                  <span
                    ref={setTerminalRef("resolving")}
                    className="text-white/45"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <TerminalTick tickRef={setTickRef("added")} />
                  <span
                    ref={setTerminalRef("added")}
                    className="text-[#35c58b]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white/0">•</span>
                  <span
                    ref={setTerminalRef("reduced")}
                    className="text-white/45"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <TerminalTick tickRef={setTickRef("done")} />
                  <span
                    ref={setTerminalRef("done")}
                    className="text-[#35c58b]"
                  />
                  <span
                    ref={setTerminalRef("doneCursor")}
                    className="inline-block h-[1.15em] w-[0.45em] bg-[#ff7a1a] opacity-0"
                  />
                </div>
              </div>
            </Panel>

            <Panel title="app/page.jsx" className="min-h-[20vw] max-md:order-last">
              <div className="space-y-[0.55vw] font-mono text-[1vw] leading-[1.95] text-white/78 max-md:space-y-1 max-md:text-[13px]">
                <div ref={setCodeRef("line1")} />
                <div ref={setCodeRef("line2")} />
                <div ref={setCodeRef("line3")} />
                <div ref={setCodeRef("line4")} />
                <div ref={setCodeRef("line5")} />
              </div>
            </Panel>
          </div>

          <div className="flex flex-col gap-[1.15vw]">
            <Panel title="amazing_project / Components" className="h-full">
              <div className="space-y-[0.9vw] max-md:space-y-3">
                <TreeFolder label="app" depth={0} />

                <div className="pl-[1.35vw] max-md:pl-5">
                  <div className="relative ml-[0.38vw] border-l border-white/10 pl-[1.1vw] max-md:ml-1.5 max-md:pl-4">
                    <div className="flex items-center gap-3 text-white/80">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-[1.05vw] w-[1.05vw] shrink-0 text-[#c084fc] max-md:h-4 max-md:w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M7 3.75h6l4 4v12.5H7A1.25 1.25 0 0 1 5.75 19V5A1.25 1.25 0 0 1 7 3.75z" />
                        <path d="M13 3.75V8h4.25" />
                      </svg>

                      <span className="font-mono text-[1.05vw] text-white/76 max-md:text-[15px]">
                        page.jsx
                      </span>
                    </div>
                  </div>
                </div>

                <TreeFolder label="components" depth={0} />

                <div className="pl-[1.35vw] max-md:pl-5">
                  <div className="relative ml-[0.38vw] border-l border-white/10 pl-[1.1vw] max-md:ml-1.5 max-md:pl-4">
                    <TreeFolder label="hyperiux" depth={0} />

                    <div className="space-y-[0.35vw] pl-[1.35vw] pt-[0.55vw] max-md:space-y-1.5 max-md:pl-5 max-md:pt-2">
                      <TreeFile
                        label="scroll-stack.jsx"
                        rowRef={setFileRef("scrollStackRow")}
                        right={
                          <span
                            ref={setFileRef("addedBadge1")}
                            className="rounded-full bg-[#1a7f37]/20 px-3 py-1 font-mono text-[0.95vw] text-[#61d38d] opacity-0 max-md:text-xs"
                          >
                            + Added
                          </span>
                        }
                        className="bg-[linear-gradient(90deg,rgba(255,122,26,0.08),rgba(34,197,94,0.36))]"
                      />

                      <TreeFile
                        label="use-lenis.jsx"
                        rowRef={setFileRef("useLenisRow")}
                        right={
                          <span
                            ref={setFileRef("addedBadge2")}
                            className="rounded-full bg-[#1a7f37]/20 px-3 py-1 font-mono text-[0.95vw] text-[#61d38d] opacity-0 max-md:text-xs"
                          >
                            + Added
                          </span>
                        }
                        className="bg-[linear-gradient(90deg,rgba(255,122,26,0.08),rgba(34,197,94,0.36))]"
                      />

                      <TreeFile
                        label="reduced-motion.js"
                        rowRef={setFileRef("reducedMotionRow")}
                        right={
                          <span
                            ref={setFileRef("addedBadge3")}
                            className="rounded-full bg-[#1a7f37]/20 px-3 py-1 font-mono text-[0.95vw] text-[#61d38d] opacity-0 max-md:text-xs"
                          >
                            + Added
                          </span>
                        }
                        className="bg-[linear-gradient(90deg,rgba(255,122,26,0.08),rgba(34,197,94,0.36))]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-[1vw] max-md:pt-3">
                  <p className="font-mono text-[1.02vw] text-white/42 max-md:text-sm">
                    ui
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}