"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Copy, RotateCcw } from "lucide-react";
import styles from "./remixer-panel.module.css";

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

function formatValue(value, control) {
  if (control.format) return control.format(value);
  if (typeof value === "boolean") return value ? "on" : "off";
  if (typeof value === "object") return control.type;
  return value ?? "";
}

function normalizeColorInputValue(value) {
  if (typeof value === "number") return `#${value.toString(16).padStart(6, "0").slice(-6)}`;
  if (typeof value === "string" && /^0x[0-9a-f]{6}$/i.test(value)) return `#${value.slice(2)}`;
  if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) return value;
  return "#ffffff";
}

function ControlField({ control, value, onChange }) {
  const displayValue = formatValue(value, control);

  if (control.type === "checkbox" || control.type === "toggle") {
    return (
      <button type="button" onClick={() => onChange(!value)} className={`${styles.field} ${styles.toggleRow}`}>
        <span className={styles.fieldLabel}>{control.label}</span>
        <span className={`${styles.checkboxOuter} ${value ? styles.checkboxSelected : ""}`}>
          <span className={styles.checkboxInner} />
        </span>
      </button>
    );
  }

  if (control.type === "color") {
    const colorValue = normalizeColorInputValue(value);
    return (
      <div className={styles.field}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{colorValue}</span>
        </div>
        {control.description ? <p className={styles.fieldDescription}>{control.description}</p> : null}
        <div className={styles.colorRow}>
          <input type="color" value={colorValue} onChange={(event) => onChange(event.target.value)} className={styles.colorInput} />
        </div>
      </div>
    );
  }

  if (control.type === "radio") {
    return (
      <div className={styles.field}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{displayValue}</span>
        </div>
        {control.description ? <p className={styles.fieldDescription}>{control.description}</p> : null}
        <div className={styles.checkboxGroup}>
          {control.options?.map((option) => {
            const optionValue = option.value ?? option;
            const optionLabel = option.label ?? option;
            const isSelected = value === optionValue;

            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => onChange(optionValue)}
                className={`${styles.checkboxOption} ${isSelected ? styles.checkboxOptionSelected : ""}`}
              >
                <span className={`${styles.checkboxOuter} ${isSelected ? styles.checkboxSelected : ""}`}>
                  <span className={styles.checkboxInner} />
                </span>
                <span className={styles.checkboxText}>{optionLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (control.type === "select") {
    return (
      <label className={styles.field}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{displayValue}</span>
        </div>
        {control.description ? <p className={styles.fieldDescription}>{control.description}</p> : null}
        <select value={value} onChange={(event) => onChange(event.target.value)} className={styles.select}>
          {control.options?.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (control.type === "text" || control.type === "string") {
    return (
      <label className={styles.field}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{displayValue}</span>
        </div>
        {control.description ? <p className={styles.fieldDescription}>{control.description}</p> : null}
        <input type="text" value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={styles.textInput} />
      </label>
    );
  }

  if (control.type === "textarea" || control.type === "json/list" || control.type === "json") {
    const textValue = typeof value === "string" ? value : JSON.stringify(value ?? "", null, 2);
    return (
      <label className={styles.field}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{control.type}</span>
        </div>
        {control.description ? <p className={styles.fieldDescription}>{control.description}</p> : null}
        <textarea
          value={textValue}
          onChange={(event) => {
            if (control.type === "textarea") return onChange(event.target.value);
            try {
              onChange(JSON.parse(event.target.value));
            } catch {
              onChange(event.target.value);
            }
          }}
          className={`${styles.textInput} ${styles.textareaInput}`}
        />
      </label>
    );
  }

  if (control.type === "number") {
    return (
      <label className={styles.field}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>{control.label}</span>
          <span className={styles.fieldValue}>{displayValue}</span>
        </div>
        {control.description ? <p className={styles.fieldDescription}>{control.description}</p> : null}
        <input type="number" min={control.min} max={control.max} step={control.step ?? 1} value={value ?? ""} onChange={(event) => onChange(Number(event.target.value))} className={styles.textInput} />
      </label>
    );
  }

  return (
    <label className={styles.field}>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>{control.label}</span>
        <span className={styles.fieldValue}>{displayValue}</span>
      </div>
      {control.description ? <p className={styles.fieldDescription}>{control.description}</p> : null}
      <input type="range" min={control.min} max={control.max} step={control.step ?? 1} value={value ?? 0} onChange={(event) => onChange(Number(event.target.value))} className={styles.range} />
    </label>
  );
}

export default function RemixerPanel({ isExpanded, groups, values, onChange, onCopyCode, onReset, defaultOpenGroupId }) {
  const availableGroups = useMemo(() => groups.filter((group) => group.controls?.length), [groups]);
  const [openGroupId, setOpenGroupId] = useState(defaultOpenGroupId ?? availableGroups[0]?.id ?? null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!onCopyCode) return;
    await copyTextToClipboard(onCopyCode());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <aside className={`${styles.panel} ${isExpanded ? styles.panelOpen : ""}`}>
      <div className={`${styles.body} ${styles.hideScrollbar}`} data-lenis-prevent>
        {availableGroups.map((group) => {
          if (group.collapsible === false) {
            return (
              <section key={group.id} className={`${styles.group} ${styles.groupStatic}`}>
                {group.title ? (
                  <div className={styles.groupStaticHeader}>
                    <span className={styles.groupTitle}>{group.title}</span>
                  </div>
                ) : null}
                <div className={styles.groupBodyStatic}>
                  <div className={styles.groupBodyInner}>
                    {group.controls.map((control) => (
                      <ControlField key={control.id} control={control} value={values[control.id]} onChange={(nextValue) => onChange(control.id, nextValue)} />
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          const isOpen = openGroupId === group.id;
          return (
            <section key={group.id} className={`${styles.group} ${isOpen ? styles.groupOpen : ""}`}>
              <button type="button" onClick={() => setOpenGroupId(isOpen ? null : group.id)} className={styles.groupTrigger}>
                <span className={styles.groupTitle}>{group.title}</span>
                <ChevronDown className={styles.groupChevron} />
              </button>
              <div className={styles.groupBody}>
                <div className={styles.groupBodyInner}>
                  {group.controls.map((control) => (
                    <ControlField key={control.id} control={control} value={values[control.id]} onChange={(nextValue) => onChange(control.id, nextValue)} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <button type="button" onClick={handleCopy} className={styles.footerButton}>
            {copied ? <Check className={styles.actionIcon} /> : <Copy className={styles.actionIcon} />}
            <span className={styles.footerButtonText}>{copied ? "Copied" : "Copy code"}</span>
          </button>
          <button type="button" onClick={onReset} className={styles.footerButton}>
            <RotateCcw className={styles.actionIcon} />
            <span className={styles.footerButtonText}>Reset</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
