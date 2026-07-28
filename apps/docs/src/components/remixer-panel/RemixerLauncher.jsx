"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PanelLeft } from "lucide-react";
import RemixerPanel from "./RemixerPanel";
import styles from "./remixer-panel.module.css";

export const remixerPanelTransition = {
  duration: 0.6,
  ease: [0.62, 0.05, 0.01, 0.99],
};

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
  panelShift = -140,
  closedX = "100%",
  openX = "0%",
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`${styles.launcherLayer} ${containerClassName}`}>
      <motion.button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        animate={{ x: isExpanded ? panelShift : 0 }}
        transition={remixerPanelTransition}
        className={`${styles.launcherButton} ${buttonClassName}`}
        aria-expanded={isExpanded}
      >
        <PanelLeft className={`${styles.launcherIcon} ${isExpanded ? "" : styles.launcherIconClosed}`} />
        <span className={styles.launcherButtonText}>{buttonLabel}</span>
      </motion.button>

      <motion.div
        initial={false}
        animate={{ x: isExpanded ? openX : closedX }}
        transition={remixerPanelTransition}
        className={`${styles.launcherPanel} ${isExpanded ? styles.launcherPanelOpen : ""} ${panelClassName}`}
      >
        <div className={`${styles.launcherPanelInner} ${panelInnerClassName}`}>
          <RemixerPanel
            isExpanded={isExpanded}
            groups={groups}
            values={values}
            onChange={onChange}
            onCopyCode={onCopyCode}
            onReset={onReset}
            defaultOpenGroupId={defaultOpenGroupId}
          />
        </div>
      </motion.div>
    </div>
  );
}
