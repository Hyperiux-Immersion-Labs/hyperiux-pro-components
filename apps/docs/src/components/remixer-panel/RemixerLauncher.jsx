"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useDragControls, useSpring } from "motion/react";
import { GripVertical, PanelTop } from "lucide-react";
import RemixerPanel from "./RemixerPanel";
import styles from "./remixer-panel.module.css";

export const remixerPanelTransition = {
  duration: 0.45,
  ease: [0.62, 0.05, 0.01, 0.99],
};

const VIEWPORT_MARGIN = 16;
const TOP_LIMIT_RATIO = 0.1;

export default function RemixerLauncher({
  groups,
  values,
  onChange,
  onCopyCode,
  onReset,
  defaultOpenGroupId,
  buttonLabel = "Controls",
  buttonClassName = "",
  panelClassName = "",
  panelInnerClassName = "",
  containerClassName = "",
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragConstraints, setDragConstraints] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const groupRef = useRef(null);
  const dragControls = useDragControls();
  const dragX = useSpring(0, { stiffness: 520, damping: 42, mass: 0.55 });
  const dragY = useSpring(0, { stiffness: 520, damping: 42, mass: 0.55 });

  useEffect(() => {
    const updateDragConstraints = () => {
      const groupRect = groupRef.current?.getBoundingClientRect();
      const groupWidth = groupRect?.width ?? 0;
      const groupHeight = groupRect?.height ?? 0;
      const topOffset = window.innerHeight * TOP_LIMIT_RATIO;

      setDragConstraints({
        top: 0,
        right: 0,
        bottom: Math.max(0, window.innerHeight - topOffset - groupHeight - VIEWPORT_MARGIN),
        left: -Math.max(0, window.innerWidth - groupWidth - VIEWPORT_MARGIN),
      });
    };

    updateDragConstraints();
    window.addEventListener("resize", updateDragConstraints);

    return () => window.removeEventListener("resize", updateDragConstraints);
  }, []);

  return (
    <div className={`${styles.launcherLayer} ${containerClassName}`}>
      <motion.div
        ref={groupRef}
        className={styles.launcherGroup}
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={dragConstraints}
        style={{ x: dragX, y: dragY }}
      >
        <div className={styles.launcherRow}>
          <button
            type="button"
            className={styles.dragHandle}
            onPointerDown={(event) => dragControls.start(event)}
            aria-label="Move controls panel"
          >
            <GripVertical className={styles.dragHandleIcon} />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className={`${styles.launcherButton} ${buttonClassName}`}
            aria-expanded={isExpanded}
          >
            <PanelTop className={`${styles.launcherIcon} ${isExpanded ? styles.launcherIconOpen : ""}`} />
            <span className={styles.launcherButtonText}>{buttonLabel}</span>
          </button>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
            y: isExpanded ? 0 : -18,
          }}
          transition={{
            height: {
              ...remixerPanelTransition,
              duration: isExpanded ? 0.48 : 0.24,
              delay: isExpanded ? 0 : 0.12,
            },
            opacity: {
              duration: isExpanded ? 0.18 : 0.14,
              ease: "easeOut",
            },
            y: {
              ...remixerPanelTransition,
              duration: isExpanded ? 0.48 : 0.2,
              delay: isExpanded ? 0 : 0.08,
            },
          }}
          style={{ transformOrigin: "top" }}
          className={`${styles.launcherPanel} ${styles.hideScrollbar} ${isExpanded ? styles.launcherPanelOpen : ""} ${panelClassName}`}
        >
          <motion.div
            initial={false}
            animate={{
              y: isExpanded ? 0 : -28,
            }}
            transition={{
              ...remixerPanelTransition,
              duration: isExpanded ? 0.48 : 0.2,
              delay: isExpanded ? 0.03 : 0,
            }}
            className={`${styles.launcherPanelInner} ${panelInnerClassName}`}
          >
            <RemixerPanel
              isExpanded={isExpanded}
              groups={groups}
              values={values}
              onChange={onChange}
              onCopyCode={onCopyCode}
              onReset={onReset}
              defaultOpenGroupId={defaultOpenGroupId}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
