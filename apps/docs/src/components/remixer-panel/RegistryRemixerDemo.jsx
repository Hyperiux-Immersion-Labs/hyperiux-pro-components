"use client";

import { buildRemixerDemoCode } from "./build-remixer-code";
import RemixerLauncher from "./RemixerLauncher";
import { useRemixerControls } from "./useRemixerControls";

export default function RegistryRemixerDemo({
  registry,
  component: Component,
  children,
  render,
  copyCodeOptions,
}) {
  const remixerConfig = registry?.remixer ?? {};
  const {
    groups,
    values,
    updateValue,
    resetValues,
  } = useRemixerControls({ props: registry?.props ?? [] });

  const effect = render ? render(values) : <Component {...values} />;

  return (
    <>
      {children ? children({ values, effect }) : effect}
      {remixerConfig.enabled ? (
        <RemixerLauncher
          groups={groups}
          values={values}
          onChange={updateValue}
          onCopyCode={() =>
            buildRemixerDemoCode({
              registry,
              values,
              groups,
              ...copyCodeOptions,
            })
          }
          onReset={resetValues}
          defaultOpenGroupId={remixerConfig.defaultOpenGroupId}
          buttonClassName={remixerConfig.layout?.buttonClassName}
          panelClassName={remixerConfig.layout?.panelClassName}
        />
      ) : null}
    </>
  );
}
