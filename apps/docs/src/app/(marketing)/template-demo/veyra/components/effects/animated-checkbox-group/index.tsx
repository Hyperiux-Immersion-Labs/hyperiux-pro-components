// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import * as React from "react";
import { animate, motion, MotionConfig } from "motion/react";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduce(mq.matches);
    read();
    mq.addEventListener?.("change", read);
    return () => mq.removeEventListener?.("change", read);
  }, []);
  return reduce;
}

const spring = { type: "spring", visualDuration: 0.35, bounce: 0.3 } as const;
const snappy = { type: "spring", visualDuration: 0.25, bounce: 0 } as const;

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const PALETTE = {
  "--checkbox-accent": "#202b4a",
  "--checkbox-on-accent": "#f5f6fa",
  "--checkbox-text": "#151927",
  "--checkbox-muted-text": "#73798a",
  "--checkbox-border": "#c9cddb",
} as React.CSSProperties;

type GroupContextValue = {
  selected: string[];
  toggle: (value: string) => void;
};

const GroupContext = React.createContext<GroupContextValue | null>(null);
const IndexContext = React.createContext(0);

type CheckboxGroupProps = {
  value: string[];
  onValueChange: (value: string[]) => void;
  children: React.ReactNode;
  className?: string;
  "aria-label": string;
};

export function CheckboxGroup({ value, onValueChange, children, className, "aria-label": ariaLabel }: CheckboxGroupProps) {
  const reduce = usePrefersReducedMotion();
  const latest = React.useRef(value);
  React.useEffect(() => {
    latest.current = value;
  });
  const order = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child) => (child.props as { value: string }).value);

  const toggle = (v: string) => {
    const current = latest.current;
    const next = current.includes(v) ? current.filter((c) => c !== v) : [...current, v];
    const ordered = order.filter((o) => next.includes(o));
    latest.current = ordered;
    onValueChange(ordered);
  };

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      <GroupContext.Provider value={{ selected: value, toggle }}>
        <div role="group" aria-label={ariaLabel} className={cx("flex w-full flex-col", className)} style={PALETTE}>
          {React.Children.toArray(children).map((child, index) => (
            <IndexContext.Provider key={index} value={index}>
              {child}
            </IndexContext.Provider>
          ))}
        </div>
      </GroupContext.Provider>
    </MotionConfig>
  );
}

type CheckboxItemProps = {
  value: string;
  label: React.ReactNode;
  className?: string;
  boxClassName?: string;
};

export function CheckboxItem({ value, label, className, boxClassName = "h-[2.4vh] aspect-square" }: CheckboxItemProps) {
  const group = React.useContext(GroupContext);
  const index = React.useContext(IndexContext);
  const reduceMotion = usePrefersReducedMotion();
  const visual = React.useRef<HTMLSpanElement>(null);
  const [entered, setEntered] = React.useState(false);
  const checked = group?.selected.includes(value) ?? false;

  const [wasChecked, setWasChecked] = React.useState(checked);
  const [pulse, setPulse] = React.useState(0);
  if (checked !== wasChecked) {
    setWasChecked(checked);
    if (checked) setPulse((p) => p + 1);
  }

  React.useEffect(() => {
    if (pulse === 0 || reduceMotion || !visual.current) return;
    animate(visual.current, { scale: [1, 0.7, 1.25, 0.94, 1] }, { duration: 0.55, times: [0, 0.2, 0.5, 0.75, 1], ease: "easeOut" });
  }, [pulse, reduceMotion]);

  return (
    <motion.label
      data-checked={checked || undefined}
      className={cx("group/checkbox relative flex cursor-pointer items-center gap-3 select-none", className)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onAnimationComplete={() => setEntered(true)}
      transition={{ ...spring, delay: entered || reduceMotion ? 0 : index * 0.05 }}
    >
      <motion.span className={cx("relative grid shrink-0 place-items-center", boxClassName)} whileTap={{ scale: 0.85 }}>
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 scale-75 rounded-md border-2 border-(--checkbox-accent)/40 opacity-0 transition-[opacity,scale] duration-300 motion-reduce:transition-none group-has-focus-visible/checkbox:scale-100 group-has-focus-visible/checkbox:opacity-100"
        />
        <span
          ref={visual}
          aria-hidden
          className={cx(
            "absolute inset-0 overflow-hidden rounded-md border transition-colors duration-200 motion-reduce:transition-none",
            checked ? "border-(--checkbox-accent)" : "border-(--checkbox-border) group-hover/checkbox:border-(--checkbox-text)/40",
          )}
        >
          <motion.span
            className="absolute top-1/2 left-1/2 size-[150%] -translate-x-1/2 -translate-y-1/2 rounded-md bg-(--checkbox-accent)"
            initial={false}
            animate={{ scale: checked ? 1 : 0 }}
            transition={{ scale: snappy }}
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute inset-0 size-full text-(--checkbox-on-accent)"
          >
            <motion.path
              d="M5 12.5 10 17.5 19 7"
              initial={false}
              animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
              transition={{
                pathLength: reduceMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut", delay: checked ? 0.08 : 0 },
                opacity: { duration: 0.1 },
              }}
            />
          </svg>
        </span>
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={() => group?.toggle(value)}
          className="absolute -inset-1 z-10 cursor-[inherit] rounded-md outline-none"
        />
      </motion.span>

      <span className="relative inline-grid w-fit">
        <span
          className={cx(
            "col-start-1 row-start-1 transition-colors duration-200 motion-reduce:transition-none",
            checked ? "text-(--checkbox-muted-text)" : "text-(--checkbox-text)",
          )}
        >
          {label}
        </span>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 origin-left rounded-md bg-(--checkbox-muted-text)"
          initial={false}
          animate={{ scaleX: checked ? 1 : 0 }}
          transition={snappy}
        />
      </span>
    </motion.label>
  );
}

export function RollingNumber({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span>
      <span className="sr-only">{value}</span>
      {digits.map((digit, i) => (
        <RollingDigit key={digits.length - i} digit={Number(digit)} />
      ))}
    </span>
  );
}

function RollingDigit({ digit }: { digit: number }) {
  return (
    <span aria-hidden className="relative inline-block [clip-path:inset(0)]">
      <span className="invisible">{digit}</span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-digit * 10}%` }}
        transition={spring}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n}>{n}</span>
        ))}
      </motion.span>
    </span>
  );
}
