"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, RotateCcw } from "lucide-react";
import styles from "./remixer-panel.module.css";

function ControlField({ control, value, onChange, delay = 0 }) {
  const formattedValue = control.format ? control.format(value) : value;

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
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={styles.colorInput}
          />
          <span className={styles.colorText}>{value}</span>
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

  return (
    <label className={styles.field} style={{ "--item-delay": `${delay}ms` }}>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{control.label}</span>
        <span className={styles.fieldValue}>{formattedValue}</span>
      </div>
      <input
        type="range"
        min={control.min}
        max={control.max}
        step={control.step ?? 1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={styles.range}
      />
      {control.description ? (
        <p className={styles.fieldDescription}>{control.description}</p>
      ) : null}
    </label>
  );
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
  const [copyState, setCopyState] = useState("idle");
  const [resetSpin, setResetSpin] = useState(false);

  const availableGroups = useMemo(
    () => groups.filter((group) => Array.isArray(group.controls) && group.controls.length > 0),
    [groups],
  );

  useEffect(() => {
    if (copyState !== "copied") return;
    setCopyState("idle");
  }, [values]);

  const toggleGroup = (groupId) => {
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  };

  const handleCopy = async () => {
    if (!onCopyCode) return;

    try {
      const code = onCopyCode();
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1200);
    } catch {
      setCopyState("idle");
    }
  };

  const handleReset = () => {
    setResetSpin(true);
    onReset();
    window.setTimeout(() => setResetSpin(false), 420);
  };

  return (
    <aside className={`${styles.panel} ${isExpanded ? styles.panelOpen : styles.panelClosed}`}>
      <div className={styles.body}>
        {availableGroups.map((group, groupIndex) => {
          const isOpen = openGroupId === group.id;
          const groupDelay = `${groupIndex * 120}ms`;

          return (
            <section
              key={group.id}
              className={`${styles.group} ${isOpen ? styles.groupOpen : ""}`}
              style={{ "--group-delay": groupDelay }}
            >
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
            </section>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <button
            type="button"
            onClick={handleCopy}
            className={`${styles.footerButton} ${copyState === "copied" ? styles.buttonFeedback : ""}`}
            data-tooltip={copyState === "copied" ? "Copied" : "Copy code"}
          >
            {copyState === "copied" ? (
              <Check className={styles.actionIcon} />
            ) : (
              <Copy className={styles.actionIcon} />
            )}
            <span className={styles.footerButtonText}>
              {copyState === "copied" ? "Copied" : "Copy code"}
            </span>
            <span className={styles.tooltip}>{copyState === "copied" ? "Copied" : "Copy code"}</span>
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
