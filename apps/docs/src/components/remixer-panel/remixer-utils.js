"use client";

export function cloneRemixerValues(values = {}) {
  if (typeof structuredClone === "function") return structuredClone(values);
  return JSON.parse(JSON.stringify(values));
}

export function getDefaultsFromProps(props = []) {
  return props.reduce((defaults, prop) => {
    if (!prop || prop.docsOnly) return defaults;
    if ("demoDefault" in prop) {
      defaults[prop.name] = prop.demoDefault;
      return defaults;
    }
    if ("default" in (prop.remixer ?? {})) {
      defaults[prop.name] = prop.remixer.default;
      return defaults;
    }
    if ("default" in prop) defaults[prop.name] = prop.default;
    return defaults;
  }, {});
}

export function getGroupsFromProps(props = []) {
  const groupMap = new Map();

  for (const prop of props) {
    if (!prop?.remixer) continue;
    const groupId = prop.remixer.group ?? "controls";
    if (!groupMap.has(groupId)) {
      groupMap.set(groupId, {
        id: groupId,
        title: prop.remixer.groupTitle ?? toControlLabel(groupId),
        collapsible: prop.remixer.groupCollapsible ?? true,
        controls: [],
      });
    }
    groupMap.get(groupId).controls.push(
      normalizeRemixerControl({
        id: prop.name,
        name: prop.name,
        label: prop.label,
        type: prop.remixer.control,
        default: prop.default,
        description: prop.description,
        min: prop.remixer.min,
        max: prop.remixer.max,
        step: prop.remixer.step,
        options: prop.remixer.options,
        placeholder: prop.remixer.placeholder,
        docsOnly: prop.docsOnly,
        copyable: prop.copyable,
      }),
    );
  }

  return [...groupMap.values()];
}

export function getCopyableRemixerValues(values = {}, groups = []) {
  const allowedIds = new Set();
  for (const group of groups) {
    for (const control of group.controls ?? []) {
      if (!control || control.docsOnly || control.copyable === false) continue;
      allowedIds.add(control.id);
    }
  }
  return Object.fromEntries(Object.entries(values).filter(([id]) => allowedIds.has(id)));
}

export function normalizeRemixerControl(control = {}) {
  const type = control.control ?? control.type ?? "range";
  return {
    ...control,
    id: control.id ?? control.name,
    label: control.label ?? toControlLabel(control.name ?? control.id ?? ""),
    type,
  };
}

export function normalizeRemixerGroups(groups = []) {
  return groups.map((group, index) => ({
    ...group,
    id: group.id ?? `group-${index}`,
    title: group.title,
    controls: (group.controls ?? []).map(normalizeRemixerControl),
  }));
}

function toControlLabel(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
