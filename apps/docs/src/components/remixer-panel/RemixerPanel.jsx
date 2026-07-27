"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { Check, ChevronDown, Copy, RotateCcw } from "lucide-react";
import styles from "./remixer-panel.module.css";

const COPY_ICON_RESET_DELAY_MS = 2000;

const bodyVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.25 },
  },
};

const groupItemVariants = {
  hidden: { opacity: 0, x: 18 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.62, 0.05, 0.01, 0.99] },
  },
};

function animateIconSwap(element, rotation, onSwapped) {
  return gsap
    .timeline()
    .to(element, {
      scale: 0,
      rotation,
      duration: 0.2,
      ease: "power2.in",
      onComplete: onSwapped,
    })
    .to(element, {
      scale: 1.2,
      rotation: 0,
      duration: 0.3,
      ease: "back.out(1.7)",
    })
    .to(element, {
      scale: 1,
      duration: 0.15,
      ease: "power2.out",
    });
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.className = "clipboard-fallback";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

function ControlField({ control, value, onChange, delay = 0 }) {
  const formattedValue = control.format ? control.format(value) : value;
  const textValue = value ?? "";
  const colorValue = normalizeColorInputValue(value);

  if (control.type === "toggle" || control.type === "checkbox") {
    const isCheckbox = control.type === "checkbox";
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`${styles.field} ${styles.toggleRow}`}
        style={{ "--item-delay": `${delay}ms` }}
      >
        <span className={styles.fieldLabel}>{control.label}</span>
        <span className={isCheckbox ? `${styles.checkboxOuter} ${value ? styles.checkboxOptionSelected : ""}` : `${styles.toggle} ${value ? styles.toggleOn : ""}`}>
          {isCheckbox ? <span className={styles.checkboxInner} /> : <span className={styles.toggleKnob} />}
        </span>
      </button>
    );
  }

  if (control.type === "color") {
    return (
      <div className={styles.field} style={{ "--item-delay": `${delay}ms` }}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{formattedValue}</span>
        </div>
        <div className={styles.colorRow}>
          <input
            type="color"
            value={colorValue}
            onChange={(event) => onChange(event.target.value)}
            className={styles.colorInput}
          />
          <span className={styles.colorText}>{colorValue}</span>
        </div>
      </div>
    );
  }

  if (control.type === "select") {
    return (
      <label className={styles.field} style={{ "--item-delay": `${delay}ms` }}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{formattedValue}</span>
        </div>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={styles.select}
        >
          {control.options?.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
        {control.description ? (
          <p className={styles.fieldDescription}>{control.description}</p>
        ) : null}
      </label>
    );
  }

  if (control.type === "radio") {
    return (
      <div className={styles.field} style={{ "--item-delay": `${delay}ms` }}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{formattedValue}</span>
        </div>
        <div className={styles.checkboxGroup}>
          {control.options?.map((option) => {
            const optionValue = option.value ?? option;
            const selected = optionValue === value;

            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => onChange(optionValue)}
                className={`${styles.checkboxOption} ${
                  selected ? styles.checkboxOptionSelected : ""
                }`}
              >
                <span className={styles.checkboxOuter}>
                  <span className={styles.checkboxInner} />
                </span>
                <span className={styles.checkboxText}>{option.label ?? option}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (control.type === "text" || control.type === "string") {
    return (
      <label className={styles.field} style={{ "--item-delay": `${delay}ms` }}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{formattedValue}</span>
        </div>
        {control.description ? (
          <p className={styles.fieldDescription}>{control.description}</p>
        ) : null}
        <input
          type="text"
          value={textValue}
          onChange={(event) => onChange(event.target.value)}
          className={styles.textInput}
          placeholder={control.placeholder}
        />
      </label>
    );
  }

  if (
    control.type === "textarea" ||
    control.type === "json" ||
    control.type === "json/list" ||
    control.type === "asset-list/json"
  ) {
    return (
      <label className={styles.field} style={{ "--item-delay": `${delay}ms` }}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{control.type}</span>
        </div>
        {control.description ? (
          <p className={styles.fieldDescription}>{control.description}</p>
        ) : null}
        <textarea
          value={typeof textValue === "string" ? textValue : JSON.stringify(textValue, null, 2)}
          onChange={(event) => {
            if (control.type === "textarea") {
              onChange(event.target.value);
              return;
            }

            try {
              onChange(JSON.parse(event.target.value));
            } catch {
              onChange(event.target.value);
            }
          }}
          className={`${styles.textInput} ${styles.textareaInput}`}
          placeholder={control.placeholder}
        />
      </label>
    );
  }

  if (control.type === "number") {
    return (
      <label className={styles.field} style={{ "--item-delay": `${delay}ms` }}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{formattedValue}</span>
        </div>
        {control.description ? (
          <p className={styles.fieldDescription}>{control.description}</p>
        ) : null}
        <input
          type="number"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={value ?? ""}
          onChange={(event) => onChange(Number(event.target.value))}
          className={styles.textInput}
        />
      </label>
    );
  }

  if (control.type === "range" || control.type === "slider") {
    return (
      <label className={styles.field} style={{ "--item-delay": `${delay}ms` }}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{formattedValue}</span>
        </div>
        {control.description ? (
          <p className={styles.fieldDescription}>{control.description}</p>
        ) : null}
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={styles.range}
        />
      </label>
    );
  }

  return (
    <label className={styles.field} style={{ "--item-delay": `${delay}ms` }}>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{control.label}</span>
        <span className={styles.fieldValue}>{formattedValue}</span>
      </div>
      {control.description ? (
        <p className={styles.fieldDescription}>{control.description}</p>
      ) : null}
      <input
        type="text"
        value={textValue}
        onChange={(event) => onChange(event.target.value)}
        className={styles.textInput}
      />
    </label>
  );
}

function normalizeColorInputValue(value) {
  if (typeof value === "number") {
    return `#${value.toString(16).padStart(6, "0").slice(-6)}`;
  }

  if (typeof value === "string" && /^0x[0-9a-f]{6}$/i.test(value)) {
    return `#${value.slice(2)}`;
  }

  if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) {
    return value;
  }

  return "#ffffff";
}

export default function RemixerPanel({
  isExpanded,
  groups,
  values,
  onChange,
  onCopyCode,
  onReset,
  defaultOpenGroupId,
}) {
  const [openGroupId, setOpenGroupId] = useState(defaultOpenGroupId ?? groups[0]?.id ?? null);
  const [resetSpin, setResetSpin] = useState(false);
  const [copied, setCopied] = useState(false);
  const iconRef = useRef(null);
  const resetTimeoutRef = useRef(null);
  const animationTimelineRef = useRef(null);

  const availableGroups = useMemo(
    () => groups.filter((group) => Array.isArray(group.controls) && group.controls.length > 0),
    [groups],
  );

  const clearCopyAnimation = () => {
    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    animationTimelineRef.current?.kill();
    animationTimelineRef.current = null;
  };

  useEffect(() => () => clearCopyAnimation(), []);

  const toggleGroup = (groupId) => {
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  };

  const handleCopy = async () => {
    if (!onCopyCode) return;

    try {
      await copyTextToClipboard(onCopyCode());

      if (!iconRef.current) return;

      clearCopyAnimation();
      animationTimelineRef.current = animateIconSwap(iconRef.current, -180, () => {
        setCopied(true);
      });

      resetTimeoutRef.current = window.setTimeout(() => {
        resetTimeoutRef.current = null;
        if (!iconRef.current) return;
        animationTimelineRef.current = animateIconSwap(iconRef.current, 180, () => {
          setCopied(false);
        });
      }, COPY_ICON_RESET_DELAY_MS);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setResetSpin(true);
    onReset?.();
    window.setTimeout(() => setResetSpin(false), 420);
  };

  return (
    <aside className={`${styles.panel} ${isExpanded ? styles.panelOpen : styles.panelClosed}`}>
      <motion.div
        className={styles.body}
        variants={bodyVariants}
        initial="hidden"
        animate={isExpanded ? "visible" : "hidden"}
      >
        {availableGroups.map((group) => {
          const hasTitle = Boolean(group.title);
          const isOpen = hasTitle ? openGroupId === group.id : true;

          return (
            <motion.section
              key={group.id}
              className={`${styles.group} ${isOpen ? styles.groupOpen : ""}`}
              variants={groupItemVariants}
            >
              {hasTitle ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={styles.groupTrigger}
                  aria-expanded={isOpen}
                  aria-controls={`remixer-group-${group.id}`}
                >
                  <span className={styles.groupTitle}>{group.title}</span>
                  <ChevronDown className={styles.groupChevron} />
                </button>
              ) : null}

              <div id={`remixer-group-${group.id}`} className={styles.groupBody}>
                <div className={styles.groupBodyInner}>
                  {group.controls.map((control, controlIndex) => (
                    <ControlField
                      key={control.id}
                      control={control}
                      value={values[control.id]}
                      onChange={(nextValue) => onChange(control.id, nextValue)}
                      delay={controlIndex * 110}
                    />
                  ))}
                </div>
              </div>
            </motion.section>
          );
        })}
      </motion.div>

      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <button
            type="button"
            onClick={handleCopy}
            className={`${styles.footerButton} ${copied ? styles.buttonFeedback : ""}`}
            aria-label="Copy code to clipboard"
          >
            <span ref={iconRef} className="inline-flex">
              {copied ? (
                <Check className={styles.actionIcon} />
              ) : (
                <Copy className={styles.actionIcon} />
              )}
            </span>
            <span className={styles.footerButtonText}>{copied ? "Copied" : "Copy code"}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className={styles.footerButton}
            data-tooltip="Reset controls"
          >
            <RotateCcw className={`${styles.actionIcon} ${resetSpin ? styles.actionIconSpin : ""}`} />
            <span className={styles.footerButtonText}>Reset</span>
            <span className={styles.tooltip}>Reset controls</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
