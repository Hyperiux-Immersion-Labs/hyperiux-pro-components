# Remixer Panel System Plan

> **Status (2026-11-02):** the system this plan describes is built. The `registry.json`
> `props`/`remixer` shape is live across the registry, and the implementation lives in
> `apps/docs/src/components/remixer-panel/` and `apps/docs/src/components/local-remixer/`
> as TypeScript (see "Implemented Files" below). Parts that are still only planned (most of
> the extra control types, `visibleWhen`, import lines in copied code) are marked as such.

## Intro: Implementation Steps

This document is a planning guide for making the Remixer Panel a reusable effect-level system, not a `DemoContent.tsx`-specific pattern. `spider-particles` was the first reference example because it already had a working panel.

- Define the Remixer Panel contract independently from any page file, including values, schema, control groups, callbacks, generated-code behavior, and layout presets.
- Create a central control schema model that can describe all current control types and future control types without rewriting every effect.
- Create a reusable state hook for remixer values so each effect does not hand-roll `useState`, update handlers, and reset behavior.
- Create a reusable launcher/container for the floating Controls button and slide-in panel chrome, with presets for each effect layout.
- Create generic code-generation utilities that can output valid installable snippets while filtering docs-only controls.
- Create a registry import resolver so copied snippets use the installed component path, not docs-local imports.
- Validate the system against `spider-particles` as an example, without making the design specific to it.
- Validate that spider-particles still works in the docs preview while copied code only includes props supported by the registry component.
- Define a reusable checklist that any effect can follow when adopting the Remixer Panel.
- Apply the shared system to other effects later only after the reusable contract is finalized.

## Goal

Build a reusable Remixer Panel system that can be attached to any effect preview, page, sandbox, registry demo, or future docs surface.

The system must not depend on a file named `DemoContent.tsx`. That file can keep using the remixer during the current docs migration, but it should be only one consumer of the system. The reusable pieces should work anywhere that can render React client components.

The desired behavior:

- Any effect can declare a schema and defaults, then get a working live panel.
- Live controls update the preview immediately.
- Reset returns all controls to the declared defaults.
- Copy code emits valid, ready-to-paste code for the installable registry component.
- Docs-only preview controls can exist, but they must be excluded from copied code unless the installable component supports them.
- Panel layout can be shared through presets, but individual effects can override placement/size when needed.
- The control schema can grow as more effects need richer inputs.

## Effect Prop Inventory

Use [remixer-effect-props.md](./remixer-effect-props.md) as the current free/pro effect prop inventory. It lists each registry effect separately, with detected public props, defaults, likely value type, suggested Remixer control, and a short planning description.

That inventory is intentionally broad. It should be used to decide which controls each effect can expose now, which props need richer metadata, and which fixed effects need public props before they can support the shared Remixer Panel.

## Registry Source Of Truth

The prop inventory is read-only planning output. The real source of truth must live under `registry/effects/<category>/<effect>/`, because that is the code users install into their own systems.

Each effect needs two connected pieces:

- `registry/effects/<category>/<effect>/index.tsx`: the installable component must accept the prop in its public API and use it in the live effect.
- `registry/effects/<category>/<effect>/registry.json`: the same effect should declare public prop metadata that docs, demos, generated copy code, public registry JSON, and Sanity sync scripts can read.

Do not make `apps/docs/src/lib/effect-configs.js`, any demo `DemoContent.tsx`, or Sanity the canonical prop source. Those systems should consume the registry metadata, not redefine it.

Current `registry.json` shape (trimmed from `spider-particles`):

```json
{
  "name": "spider-particles",
  "props": [
    {
      "name": "particleCount",
      "type": "number",
      "default": 180,
      "description": "Controls how many particles are drawn.",
      "remixer": {
        "control": "range",
        "group": "density",
        "groupTitle": "Density",
        "min": 20,
        "max": 1200,
        "step": 1
      }
    },
    {
      "name": "showWeb",
      "type": "boolean",
      "default": true,
      "description": "Turns the connection lines on or off.",
      "remixer": {
        "control": "checkbox",
        "group": "appearance",
        "groupTitle": "Appearance"
      }
    },
    {
      "name": "webColor",
      "type": "color",
      "default": "#ffffff",
      "description": "Colors the cursor connection lines. Needs Show Web on.",
      "remixer": {
        "control": "color",
        "group": "appearance",
        "groupTitle": "Appearance",
        "disabledWhen": { "prop": "showWeb", "equals": false }
      }
    }
  ],
  "remixer": {
    "enabled": true,
    "defaultOpenGroupId": "density",
    "layout": {
      "buttonClassName": "right-4! top-25!",
      "panelClassName": "right-0! top-[132px]! h-[calc(100%-132px)]! w-[344px]!"
    },
    "copyCode": {
      "includeOnlyPublicProps": true
    }
  }
}
```

The `props` array describes the public installable API. The nested `remixer` object describes how each prop should render in the Remixer Panel. A prop can exist without a remixer control if it should be documented but not live-editable. `remixer.disabledWhen` and `remixer.hideWhenReducedMotion` are covered in [effect-remixer-standards.md](./effect-remixer-standards.md).

Other top-level `remixer` keys the code reads: `enabled` (shows the panel and copy button), `defaultOpenGroupId`, and optionally `groups` / `controls` to override the groups built from `props`. `remixer.layout` and `remixer.copyCode` are written to every registry item (`component-ship.mjs` scaffolds `layout: "panel"`, older effects carry class-name objects) but nothing in `apps/docs/src` reads them at the moment; the panel lives in the demo header, and copy filtering is driven per prop by `docsOnly` / `copyable`.

Docs-only controls are allowed, but they must be marked so copied code does not include props the installed component cannot accept. `docsOnly: true` keeps the prop out of copied code and out of the initial values built from `props` (its control still renders); `copyable: false` keeps the control live with its default but out of copied code:

```json
{
  "name": "demoBackground",
  "type": "color",
  "default": "#050505",
  "description": "Docs preview background color.",
  "docsOnly": true,
  "remixer": {
    "control": "color",
    "group": "Preview"
  }
}
```

## Sync Flow

The current flow is:

```txt
registry/effects/<category>/<effect>/index.tsx
  + registry/effects/<category>/<effect>/registry.json props/remixer metadata
  -> apps/docs/scripts/build-registry.js
  -> apps/docs/public/r/<effect>.json (+ registry/index.json)
  -> docs demo (page.tsx imports registry.json) + effect detail + copy-code generator
  -> Sanity sync script later, if Sanity should store/search/display prop metadata
```

`apps/docs/scripts/build-registry.js` copies `props` and `remixer` from each effect `registry.json` into the registry item it writes. `apps/docs/scripts/build-registry-dist.js` packs each effect together with its local `registry.json`, so the npm/package artifact carries the same metadata.

## Non-Goals For This Planning Step

- Do not migrate all effects yet.
- Do not change every effect API.
- Do not force every effect into the same `DemoContent.tsx` structure.
- Do not make copied code depend on docs-only components or docs-only imports.
- Do not rewrite `RemixerPanel.tsx` styling unless the later implementation proves a contract gap.

## System Contract

The remixer system is made of reusable primitives:

```txt
registry.json props (+ remixer)
  -> useRemixerControls (groups, values, reset)
  -> RegistryRemixerDemo (provides them to the demo header)
  -> DemoHeader renders RemixerPanel
  -> buildRemixerJsx copied snippet (or a page-supplied buildCode)
```

The page or preview component should only provide:

- the registry object (`registry.json`, or a draft `{ props, remixer }` through `LocalRemixerDemo`)
- live preview rendering (`component`, `render` or `children`)
- an optional copied-code strategy (`copyCodeOptions.buildCode`)

The shared system should own:

- state updates
- reset behavior
- panel open/close chrome
- common control rendering
- value formatting
- registry-safe filtering
- copy-code assembly
- import-path lookup (planned; copied code is currently a bare `<Component ... />` with no import line)

## Control Schema Model

Each effect describes controls with plain objects. In practice they are built from `registry.json` `props` by `getGroupsFromProps` in `remixer-utils.ts`; `RemixerControl` in `types.ts` is the resulting shape. `spider-particles` uses `range`, `color` and `checkbox`, but the model is not limited to those.

Base shape:

```js
const controlGroups = [
  {
    id: "group-id",
    title: "Group Title",
    description: "Optional group description",
    controls: [
      {
        id: "propName",
        label: "Prop Label",
        type: "range",
        default: 10,
        description: "Optional helper text",
      },
    ],
  },
];
```

Required common fields:

- `id`: stable value key, usually matching the prop name (falls back to `name`).
- `label`: user-facing control label (generated from the name when missing).
- `type`: renderer/formatter type (from `remixer.control`; defaults to `range`).

Optional fields the code supports today:

- `description`: short helper text.
- `default`: the prop default (initial values come from `demoDefault`, then `remixer.default`, then `default`).
- `min`, `max`, `step`, `options`, `placeholder`: control-specific settings.
- `docsOnly`: excluded from copied code and from the initial values.
- `copyable`: `false` keeps a live control out of copied code.
- `format`: optional display formatter for the panel value.
- `disabledWhen`: conditional disabled rule (see [effect-remixer-standards.md](./effect-remixer-standards.md)).
- `hideWhenReducedMotion`: removed from the panel while reduced motion is on.
- `group`, `groupTitle`, `groupCollapsible`: grouping.

Still planned, not implemented:

- `propName`: installable prop name when it differs from `id`.
- `serialize`: per-control code serializer override.
- `visibleWhen`: conditional display rule.
- `section`: UI grouping metadata for future layouts.

## Control Types

The Remixer Panel supports the types below and leaves a clean path for richer future controls.

### Current Implemented Types

These are rendered by `ControlField` in `apps/docs/src/components/remixer-panel/RemixerPanel.tsx`:

| Type | Value Shape | UI | Code Output |
|---|---|---|---|
| `range` | number | slider + numeric input | unquoted number |
| `color` | string | color picker + text | quoted string |
| `select` | string or number | select menu | by value type |
| `radio` | string or number | segmented/radio options | by value type |
| `toggle` / `checkbox` | boolean | checkbox row (same renderer) | `true` / `false` |
| `text` / `string` | string | text input | quoted string |
| `textarea` | string | multiline input | quoted string |
| `json` / `json/list` | object/array | textarea parsed as JSON | JSON literal |
| `number` | number | numeric input | unquoted number |

### Planned Additional Types

These should be supported by the shared schema even if their renderers are implemented later:

| Type | Value Shape | Intended UI | Notes |
|---|---|---|---|
| `code` | string | monospace editor/input | For short snippets or templates. |
| `color-rgba` | string or object | rgba picker | Useful for alpha-aware colors. |
| `gradient` | string or object | gradient editor | Useful for background and text effects. |
| `vector2` | `{ x, y }` or tuple | paired numeric inputs | Coordinates, offsets, origins. |
| `vector3` | `{ x, y, z }` or tuple | triple numeric inputs | 3D transforms, camera positions. |
| `size` | `{ width, height }` | paired numeric inputs | Canvas, cards, media sizes. |
| `spacing` | number or object | linked spacing inputs | Padding, gap, margin controls. |
| `angle` | number | dial or numeric input | Rotation, hue, direction. |
| `duration` | number | numeric/range input | Animation durations in seconds/ms. |
| `easing` | string | select or curve picker | Animation easing tokens. |
| `image` | string | URL/file-like text input | Demo image URLs and assets. |
| `asset-list` | array | list editor | Sliders, galleries, trails. |
| `object` | object | nested group editor | Config object props. |
| `array` | array | repeatable list editor | Items, tabs, FAQ entries. |
| `compound` | custom | effect-provided renderer | Escape hatch for complex effect-specific UI. |

### Type Rules

- Unknown types should not silently render as a range. (Not yet true: today any unrecognised type falls through to the range renderer.)
- If a type is not implemented in the UI yet, the shared renderer should show a clear unsupported-control state in development.
- Serialization must be type-aware and overrideable per control. (Today `buildRemixerJsx` uses `JSON.stringify` for every value; per-page overrides go through `copyCodeOptions.buildCode`.)
- Display formatting and copied-code serialization are different concerns. A formatted panel value should not automatically become copied-code output.
- Complex values should use structured serialization, not string concatenation.

## Registry Safety Model

Every control must be classified against the installable registry component.

Default: a prop in `registry.json` `props` is public and copyable.

Live preview only, kept out of copied code:

```json
{ "name": "demoBackground", "copyable": false }
```

or, for a prop the installed component doesn't accept at all:

```json
{ "name": "demoBackground", "docsOnly": true }
```

This matters because docs preview components can be richer than installable registry components. Copied code must represent what a user can actually paste after installing an effect.

Before migrating any effect, compare:

- docs remixer controls
- docs-local preview component props
- registry component props
- `importPath` in `registry.json` / `registry/index.json`

If a control affects only docs-local preview behavior, keep it in the live panel but filter it out of copied code.

## Implemented Files

All under `apps/docs/src/components/`:

| File | Role |
|---|---|
| `remixer-panel/types.ts` | `RegistryProp`, `RegistryPropRemixer`, `RemixerControl`, `RemixerGroup`, `RemixerDisabledRule` and the component prop types. |
| `remixer-panel/remixer-utils.ts` | `getDefaultsFromProps`, `getGroupsFromProps`, `normalizeRemixerGroups`, `getCopyableRemixerValues`, `getChangedCopyableRemixerValues`, `cloneRemixerValues`. |
| `remixer-panel/useRemixerControls.ts` | State hook: `{ groups, values, initialValues, setValues, updateValue, resetValues } = useRemixerControls({ props, groups?, defaults? })`. Knows nothing about pages, registry paths or code generation. |
| `remixer-panel/RegistryRemixerDemo.tsx` | The wrapper every demo uses. Builds controls from `registry.props` (or `registry.remixer.groups` / `controls`), keeps edited values in `sessionStorage` per page, syncs values into the Tablet / Phone embed iframe, adds Replay, and hands `{ registry, groups, values, onChange, onCopyCode, onReset, onReplay, defaultOpenGroupId }` to `DemoHeader` through `DemoHeaderProvider`. Also exports `getGroupsFromRemixerControls`. |
| `remixer-panel/RemixerPanel.tsx` | Renders groups and controls (`ControlField`), applies `disabledWhen` and `hideWhenReducedMotion`, Copy and Reset buttons. Rendered by `preview-chrome/DemoHeader.jsx`, `preview-chrome/PreviewChrome.tsx` and the effect page's `EffectStage.jsx`. |
| `remixer-panel/build-remixer-code.ts` | `buildRemixerJsx` (default copied code: `<ComponentName prop={value} />` from copyable values, no import line) and `buildRemixerDemoCode` (a `const props = { ... } as const;` block, currently unused). |
| `remixer-panel/remixer-panel.module.css` | Panel styles. |
| `remixer-panel/RemixerLauncher.tsx` | Floating Controls button + slide-in panel. Not used by any page at the moment; the demo header owns the panel. |
| `remixer-panel/SuggestedEffectRemixerDemo.tsx` | Standalone suggested-effect preview with its own panel. Not imported anywhere at the moment. |
| `local-remixer/LocalRemixerDemo.tsx` (+ `index.ts`) | Phase 0 scratch wrapper: takes `name`, `category`, a draft `props` array and optional `remixer` straight in the demo file, builds a registry-like object and renders `RegistryRemixerDemo`. Swapped for `RegistryRemixerDemo` once `component-ship.mjs codegen` writes the real `registry.json`. |

How demos use it:

- Most demos (`apps/docs/src/app/(marketing)/demo/<slug>/`) import the effect's `registry.json` in `page.tsx`, pass it to `DemoContent.tsx`, and wrap the effect in `<RegistryRemixerDemo registry={registry} component={Effect}>`, with `<DemoHeader />` rendered inside the children function. `render={(values) => ...}` replaces `component` when the effect needs extra wiring, and `copyCodeOptions={{ buildCode }}` replaces the default snippet (for example `parallax-image-animation`).
- A few in-progress demos use `<LocalRemixerDemo name="..." props={[...]}>` instead (currently `glass-folder` and `animated-form-fields`). `component-ship.mjs` reads that `props={[...]}` literal with `new Function`, so props built through helper functions in the demo are not picked up.

## Spider Particles As Reference Example

`spider-particles` was the first effect on the shared system and still shows the standard wiring.

Files:

- `apps/docs/src/app/(marketing)/demo/spider-particles/page.tsx` (imports `registry/effects/backgrounds/spider-particles/registry.json`)
- `apps/docs/src/app/(marketing)/demo/spider-particles/DemoContent.tsx`
- `apps/docs/src/components/spider-particles/index.tsx` (docs mirror)
- `registry/effects/backgrounds/spider-particles/index.tsx`
- `registry/effects/backgrounds/spider-particles/registry.json`

Demo wiring:

```tsx
<RegistryRemixerDemo
  registry={registry}
  component={SpiderParticles}
  copyCodeOptions={{ propsVariableName: "spiderParticlesProps" }}
>
  {({ effect }) => (
    <div className="relative min-h-screen bg-black">
      <DemoHeader />
      {effect}
    </div>
  )}
</RegistryRemixerDemo>
```

(`propsVariableName` is only read by a custom `buildCode`, so here it has no effect.)

Public props, all with remixer controls and all copyable (no docs-only props):

```js
particleCount     // range, Density
gridGap           // range, Density
particleSize      // range, Density
mouseConnectDist  // range, Interactions
spotlightRadius   // range, Interactions
particleColor     // color, Appearance
webColor          // color, Appearance, disabledWhen showWeb === false
centerColor       // color, Appearance
showWeb           // checkbox, Appearance
particlesGlow     // checkbox, Appearance
glowColor         // color, Appearance, disabledWhen particlesGlow === false
```

The earlier `lerpSpeed` and `fadeSpeed` controls are gone; they are internal constants in the component (scaled down under reduced motion), not props. `showWeb` is a full public prop.

Expected copied code with defaults (`buildRemixerJsx`):

```jsx
<SpiderParticles
  particleCount={180}
  gridGap={0}
  particleSize={20}
  mouseConnectDist={160}
  spotlightRadius={300}
  particleColor="#ffffff"
  webColor="#ffffff"
  centerColor="#ffffff"
  showWeb={true}
  particlesGlow={false}
  glowColor="#ffffff"
/>
```

The install path is `importPath` in `registry.json` (`@/components/effects/spider-particles`); the copied snippet does not include the import line.

## Spider Particles Validation Checklist

1. Open `/demo/spider-particles`.
2. Open the props panel from the demo header.
3. Change every live control and confirm the WebGL preview updates.
4. Turn Show Web off and confirm Web Color greys out; same for Particles Glow and Glow Color.
5. Reset controls and confirm defaults return.
6. Copy code and confirm it is `<SpiderParticles ... />` with every public prop and valid literals, especially `particleColor="#ffffff"`.
7. Confirm copied code parses as JSX.
8. Run lint/build for docs after changes.

## Future Effect Migration Checklist

For each effect:

1. Identify the installable registry name in `registry/index.json`.
2. Compare the docs demo controls to the registry component props.
3. Mark preview-only props with `copyable: false` (or `docsOnly: true` if the installed component can't accept them).
4. Keep all live-preview controls wired to the preview component.
5. Build copied code only from registry-safe controls.
6. Set `remixer.enabled: true` and, if needed, `remixer.defaultOpenGroupId`.
7. Verify each control type has a renderer and serializer.
8. Confirm `importPath` in `registry.json` points at the installed component path.
9. Manually test live controls, reset, and copy.
10. Apply the system one effect at a time when implementation begins, so each effect stays easy to verify.


## Final Rule

The remixer should be effect-schema driven, not page-file driven. `DemoContent.tsx` can use the system, but the system should also work for any future docs page, registry preview, sandbox, or effect showcase that passes the same schema, values, callbacks, and code-generation strategy.
