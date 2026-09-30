"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useDragControls } from "motion/react";
import { GripVertical, Monitor, Smartphone, Tablet, Zap, ZapOff } from "lucide-react";

type EffectInfoPopupProps = {
  registry?: {
    title?: string;
    name?: string;
  };
};

type ViewMode = "desktop" | "tablet" | "mobile";

const REDUCED_MOTION_PARAM = "rm";

// Runs at module load (before any effect renders) so components that read
// prefers-reduced-motion via matchMedia see it as enabled inside the
// reduced-motion preview iframe.
if (
  typeof window !== "undefined" &&
  window.self !== window.top &&
  new URLSearchParams(window.location.search).get(REDUCED_MOTION_PARAM) === "1"
) {
  const originalMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = (query: string) => {
    if (/prefers-reduced-motion\s*:\s*reduce/.test(query)) {
      const result = originalMatchMedia("all");
      return Object.defineProperty(result, "matches", { value: true }) as MediaQueryList;
    }
    if (/prefers-reduced-motion\s*:\s*no-preference/.test(query)) {
      const result = originalMatchMedia("all");
      return Object.defineProperty(result, "matches", { value: false }) as MediaQueryList;
    }
    return originalMatchMedia(query);
  };
}

function toTitle(value = "") {
  return value
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const viewOptions: { id: ViewMode; label: string; Icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", Icon: Monitor },
  { id: "tablet", label: "Tablet", Icon: Tablet },
  { id: "mobile", label: "Mobile", Icon: Smartphone },
];

const frameWidthClass: Record<ViewMode, string> = {
  desktop: "w-full",
  // iPad mini portrait (768 x 1024) - full device size, scaled to fit below
  tablet: "w-[768px] h-[1024px] shrink-0",
  mobile: "w-[min(390px,96vw)]",
};

export default function EffectInfoPopup({ registry }: EffectInfoPopupProps) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const dragControls = useDragControls();
  const [isEmbedded, setIsEmbedded] = useState(true);
  const [view, setView] = useState<ViewMode>("desktop");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fitScale, setFitScale] = useState(1);

  // The tablet frame keeps its real 768 x 1024 size (so the page inside sees
  // the right breakpoints) and is scaled down uniformly to fit the window.
  useEffect(() => {
    const updateScale = () => {
      setFitScale(
        Math.min(1, (window.innerHeight * 0.94) / 1024, (window.innerWidth * 0.96) / 768),
      );
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    setIsEmbedded(window.self !== window.top);
  }, []);

  const effectName = registry?.title ?? toTitle(registry?.name);
  if (isEmbedded || !effectName) return null;

  const showFrame = view !== "desktop" || reduceMotion;
  const frameSrc = `${typeof window !== "undefined" ? window.location.pathname : ""}${
    reduceMotion ? `?${REDUCED_MOTION_PARAM}=1` : ""
  }`;

  const optionClass = (active: boolean) =>
    `flex cursor-pointer items-center gap-[0.4vw] whitespace-nowrap rounded-full px-[0.8vw] py-[0.3vw] transition-colors ${
      active
        ? "bg-[#ff5f00] text-white"
        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
    }`;

  return (
    <>
      {showFrame ? (
        <div className="fixed inset-0 z-5100 flex items-center justify-center bg-black/85 max-[1025px]:hidden">
          <div
            className={`overflow-hidden rounded-[1vw] border border-white/15 bg-black ${
              view === "tablet" ? "" : "h-[90vh]"
            } ${frameWidthClass[view]} ${
              view === "desktop" ? "rounded-none border-0 h-full" : ""
            }`}
            style={view === "tablet" ? { transform: `scale(${fitScale})` } : undefined}
          >
            <iframe
              key={`${view}-${reduceMotion}`}
              src={frameSrc}
              title={`${effectName} ${view} preview`}
              className="h-full w-full border-0"
            />
          </div>
        </div>
      ) : null}

      <div
        ref={layerRef}
        className="pointer-events-none fixed inset-0 z-5200 max-[1025px]:hidden"
      >
        <motion.div
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={layerRef}
          className="pointer-events-auto absolute left-[2vw] top-[6vh] flex touch-none items-center gap-[0.8vw] rounded-full border border-white/15 bg-black/70 py-[0.5vw] pl-[0.5vw] pr-[0.8vw] text-[0.9vw] text-white shadow-[0_0.5vw_2vw_rgba(0,0,0,0.4)] backdrop-blur-md"
        >
          <button
            type="button"
            onPointerDown={(event) => dragControls.start(event.nativeEvent)}
            className="flex h-[2vw] w-[2vw] cursor-grab items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white active:cursor-grabbing"
            aria-label="Move effect info popup"
          >
            <GripVertical className="h-[1.1vw] w-[1.1vw]" />
          </button>

          <span className="whitespace-nowrap font-medium">{effectName}</span>

          <span className="h-[1.2vw] w-px bg-white/20" aria-hidden="true" />

          <div className="flex items-center gap-[0.6vw]">
            {viewOptions.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-pressed={view === id}
                className={optionClass(view === id)}
              >
                <Icon className="h-[0.9vw] w-[0.9vw]" aria-hidden="true" />
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setView("desktop");
                setReduceMotion((current) => !current);
              }}
              aria-pressed={reduceMotion}
              className={optionClass(reduceMotion)}
            >
              {reduceMotion ? (
                <ZapOff className="h-[0.9vw] w-[0.9vw]" aria-hidden="true" />
              ) : (
                <Zap className="h-[0.9vw] w-[0.9vw]" aria-hidden="true" />
              )}
              Reduce Motion
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
