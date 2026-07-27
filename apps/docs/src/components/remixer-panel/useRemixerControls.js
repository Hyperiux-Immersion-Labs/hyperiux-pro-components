"use client";

import { useCallback, useMemo, useState } from "react";
import {
  cloneRemixerValues,
  getDefaultsFromGroups,
  getDefaultsFromProps,
  getGroupsFromProps,
  normalizeRemixerGroups,
} from "./remixer-utils";

export function useRemixerControls({ defaults, groups, props } = {}) {
  const groupsFromProps = useMemo(
    () => getGroupsFromProps(props ?? []),
    [props],
  );

  const normalizedGroups = useMemo(
    () => normalizeRemixerGroups(groups ?? groupsFromProps),
    [groups, groupsFromProps],
  );

  const initialValues = useMemo(
    () => {
      const derivedDefaults = props?.length
        ? getDefaultsFromProps(props)
        : getDefaultsFromGroups(normalizedGroups);

      return cloneRemixerValues(defaults ?? derivedDefaults);
    },
    [defaults, props, normalizedGroups],
  );

  const [values, setValues] = useState(initialValues);

  const updateValue = useCallback((id, value) => {
    setValues((current) => ({
      ...current,
      [id]: value,
    }));
  }, []);

  const resetValues = useCallback(() => {
    setValues(cloneRemixerValues(initialValues));
  }, [initialValues]);

  return {
    groups: normalizedGroups,
    values,
    setValues,
    updateValue,
    resetValues,
  };
}
