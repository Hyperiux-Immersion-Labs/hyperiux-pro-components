// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import LineReveal from "../Animations/LineReveal";
import { HX_DARK } from "../hxPalette";
import { Bubble, BubbleContent, BubbleText, BubbleThread, ChatScope } from "../effects/animated-chat-bubble";
import TypingText from "../effects/typing-text";
import { THEME } from "../../theme";

const PROMPT = "Reconcile Q3 invoices, flag anything over budget and draft the vendor emails.";

const SCRIPT = [
  { from: "Planner", text: "Split it into 9 steps. Waking the researcher, analyst and courier." },
  { from: "Researcher", text: "Pulled the Q3 ledger and 212 vendor contracts into shared memory." },
  { from: "Analyst", text: "14 invoices are over budget. The largest is 18% above contract." },
  { from: "Critic", text: "Re-checked all 14 against source. Every figure matches." },
  { from: "Courier", text: "Drafted 14 emails. They are waiting in your sign-off queue." },
];

type Line = { id: number; from: string; text: string; mine?: boolean; typing?: boolean };

// Agents page: the Hyperiux Typing Text writes the prompt into the input, then the specialists talk the
// job through in Animated Chat Bubbles: each one shows a typing indicator, then streams its reply.
const AgentChat = () => {
  const root = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);

  // Start once the panel is on screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setStarted(true), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    if (prefersReducedMotion()) {
      at(0, () => setLines([{ id: 0, from: "You", text: PROMPT, mine: true }, ...SCRIPT.map((s, i) => ({ id: i + 1, ...s }))]));
      return () => timers.forEach(clearTimeout);
    }
    // The prompt types for under two seconds, then it is sent and the agents answer one by one
    let t = 2100;
    at(t, () => setLines([{ id: 0, from: "You", text: PROMPT, mine: true }]));
    SCRIPT.forEach((s, i) => {
      const id = i + 1;
      t += 350;
      at(t, () => setLines((cur) => [...cur, { id, ...s, typing: true }]));
      t += 600;
      at(t, () => setLines((cur) => cur.map((l) => (l.id === id ? { ...l, typing: false } : l))));
      t += 1000;
    });
    return () => timers.forEach(clearTimeout);
  }, [started]);

  return (
    <section ref={root} data-ord-orb="agents-chat" data-ord-chapter="Handoff" className="relative ord-section">
      <div className="flex items-center justify-between gap-16 ord-container max-lg:flex-col max-lg:items-start max-md:gap-10">
        <div className="flex w-[36%] flex-col gap-8 max-lg:w-full max-md:gap-6">
          <LineReveal>
            <h2>
              Watch them <span className="text-ord-stone">talk it through.</span>
            </h2>
          </LineReveal>
          <LineReveal delay={0.15}>
            <p className="text-28 text-ord-ash">
              Every handoff is a message you can read, from the plan to the last draft waiting for your sign-off.
            </p>
          </LineReveal>
        </div>
        <div className="flex w-[54%] flex-col border border-(--ord-bone)/12 max-lg:w-full">
          <div className="flex items-center justify-between border-b border-(--ord-bone)/12 px-[1.4vw] py-[1.6vh] ord-label text-14 uppercase text-ord-stone max-lg:px-[3vw] max-md:px-[4vw]">
            <span>Run 8821 / #finance-ops</span>
            <span className="flex items-center gap-2 text-ord-primary-light">
              <span className="h-[0.6vh] aspect-square rounded-full bg-(--ord-primary-light)" />5 agents
            </span>
          </div>
          <ChatScope palette={HX_DARK} className="text-22">
            <BubbleThread className="h-[52vh] px-[1.4vw] py-[2vh] max-lg:px-[3vw] max-md:h-[60vh] max-md:px-[4vw]">
              {lines.map((l) => (
                <div key={l.id} className={`flex flex-col gap-1.5 ${l.mine ? "items-end" : "items-start"}`}>
                  <span className="ord-label text-14 uppercase text-ord-stone">{l.from}</span>
                  <Bubble align={l.mine ? "end" : "start"} variant={l.mine ? "default" : "muted"} swipeToReply={false} showReactionPicker={false} doubleClickToReact={false}>
                    <BubbleContent typing={l.typing} grow={!l.mine}>
                      <BubbleText text={l.text} stream={!l.mine && !l.typing} wordDelay={28} collapsible={false} />
                    </BubbleContent>
                  </Bubble>
                </div>
              ))}
            </BubbleThread>
          </ChatScope>
          <div className="flex items-center gap-4 border-t border-(--ord-bone)/12 px-[1.4vw] py-[2vh] max-lg:px-[3vw] max-md:px-[4vw]">
            <span className="ord-label text-14 uppercase text-ord-primary-light">Prompt</span>
            <div className="min-w-0 flex-1">
              {started && lines.length === 0 ? (
                <TypingText
                  lines={[PROMPT]}
                  variant="sequential"
                  charactersPerSecond={50}
                  textColor={THEME.bone}
                  cursorColor={THEME.primaryLight}
                  backgroundColor="transparent"
                  fontSize={1}
                  fontWeight={400}
                  lineHeight={1.4}
                  cursorStyle="bar"
                  cursorWidth={2}
                  maxWidth={40}
                  holdDuration={9}
                  className="min-h-0! p-0! justify-start!"
                />
              ) : (
                <span className="text-22 text-ord-stone">{lines.length ? "Sent. The team is on it." : "Waiting for a job..."}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentChat;
