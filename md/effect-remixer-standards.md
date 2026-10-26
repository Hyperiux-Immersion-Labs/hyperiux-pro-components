# Effect Remixer & Reduced-Motion Standards

Every effect under `registry/effects/**` follows these rules. They come from the animated
shadcn components (`registry/effects/components/animated-*`), which already do all of this,
plus the `reducedMotionNote` pattern that the older effects use.

Status (rolled out to all effects on 2026-10-26):

| Rule | animated-* components (28) | Other effects (124 with props) |
|---|---|---|
| 1. `disabledWhen` on dependent props | 21 use it | 27 effects, 62 props |
| 2. `hideWhenReducedMotion` on motion-only props | 24 use it | 83 effects, 270 props |
| 3. "Needs X on." in dependent prop descriptions | yes | yes, on every `disabledWhen` prop |
| 4. Effect honours OS + simulated reduced motion | yes (`matchMedia` + `data-pc-rm`) | yes (`matchMedia`, plus the global `html[data-pc-rm]` rule in `globals.css` for CSS transitions) |
| 5. `reducedMotionNote` when motion can't be reduced | 0 (not needed so far) | 34 demos |

Effects with a note and no reducible motion (most cursors, dither-canvas, dotted-grid,
card-drift, circular-split-roll, ribbon-drift, strip-slider ...) only got `disabledWhen` rules.

Runtime support for rules 1 and 2 is already built in `apps/docs/src/components/remixer-panel/`
(`types.ts`, `remixer-utils.ts`, `RemixerPanel.tsx`). Applying them to an effect only means
editing its `registry.json` (and the effect code for rule 4). No panel changes are needed.

---

## 1. Dependent props: `disabledWhen`

If a prop only matters when another prop has a certain value, add `remixer.disabledWhen`.
The control stays visible but greyed out and can't be used.

```json
"remixer": {
  "control": "range",
  "group": "motion",
  "groupTitle": "Motion",
  "disabledWhen": { "prop": "elastic", "equals": false }
}
```

Rule shape (plain JSON, one condition per rule):

- `{ "prop": "x", "equals": value }`
- `{ "prop": "x", "notEquals": value }`
- `{ "prop": "x", "in": [a, b] }`
- An array of rules disables the control when **any** rule matches.

```json
"disabledWhen": [
  { "prop": "elastic", "equals": false },
  { "prop": "openAnimation", "equals": "fade" }
]
```

What counts as dependent:

- A setting for a feature that has an on/off toggle (fill colour → `fill`, border radius → `border`).
- A setting used by only some options of a select (bounce → only with `openAnimation: "slide"`).
- Chains: if A depends on B and B depends on C, list both rules on A.

Checklist:

- `prop` must be the exact `name` of another prop in the same registry.
- The `equals` value must have the same type as that prop (`false`, not `"false"`).
- Check the effect code: the dependent prop really has no visible effect in that state. If it
  still does something, don't disable it, fix the description instead.

## 2. Motion-only props: `hideWhenReducedMotion`

Props that only control motion (duration, stagger, easing, bounce, rolling text, tilt, parallax
strength ...) get `"hideWhenReducedMotion": true`. When reduced motion is on (OS setting or the
demo header's simulated switch, key `M`), the panel removes them, and empty groups disappear.

```json
"remixer": {
  "control": "range",
  "group": "motion",
  "groupTitle": "Motion",
  "min": 0.2,
  "max": 1.2,
  "step": 0.05,
  "hideWhenReducedMotion": true
}
```

Rules:

- Only flag a prop if the effect code actually ignores it under reduced motion (see rule 4).
  Flagging a prop that still changes something hides a working control.
- Never flag colour, size, content, layout or theme props.
- Combines with `disabledWhen` on the same prop.
- If the effect does not reduce motion at all (rule 5), don't flag anything.

## 3. Descriptions say what a prop depends on

A prop with `disabledWhen` ends its `description` with the dependency, using the other
prop's label:

- `"How much the springs overshoot. Needs Elastic on."`
- `"Track thickness while thickened. Not used when Thicken on is Never."`

Use "Needs <Label> on." for booleans and "Not used when <Label> is <Option>." for selects.

## 4. The effect itself honours reduced motion

The panel hiding props is only correct if the effect really reduces motion. The effect must
react to both:

- the OS setting `(prefers-reduced-motion: reduce)`, and
- the demo header's simulated switch, which patches `window.matchMedia` and sets
  `data-pc-rm` on `<html>`.

Read it through `window.matchMedia` at runtime (not `motion`'s `useReducedMotion`, which
doesn't see the simulation), and listen for changes:

```tsx
// Read here, not through motion's hook, so the demo's reduced-motion switch is honoured too
function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const read = () => setReduce(mq.matches)
    read()
    mq.addEventListener?.("change", read)
    return () => mq.removeEventListener?.("change", read)
  }, [])
  return reduce
}
```

Per library:

- **motion/react**: wrap in `<MotionConfig reducedMotion={reduce ? "always" : "never"}>`.
- **CSS / Tailwind transitions**: add `motion-reduce:` and `in-data-pc-rm:` variants
  (e.g. `motion-reduce:**:transition-none in-data-pc-rm:**:transition-none in-data-pc-rm:**:animate-none`).
- **GSAP / rAF / canvas / WebGL**: check `reduce` and jump to the end state, or swap the
  movement for a short opacity fade. Re-run when `reduce` changes.

What "reduced" means: no travel, scale, rotation, parallax, springs or loops. Final states
appear instantly or with a short fade. Content and interaction keep working.

## 5. Effects whose motion can't be reduced: `reducedMotionNote`

If the motion *is* the effect (cursor trails, scroll-driven rotation, page flips), don't fake
it. Pass a `reducedMotionNote` to the demo header in `DemoContent.tsx`, and don't flag any
props with `hideWhenReducedMotion`:

```tsx
reducedMotionNote={{
  title: "The pages keep turning.",
  body: "Book Flip animates each page turn as a continuous physical bend when you click or drag. Since that motion is the entire interaction, reduced motion can't be applied here.",
}}
```

Partly reducible effects reduce what they can (rule 4), flag only those props (rule 2), and use
the note to say what keeps moving.

## Scope: don't add anything else

Only the three changes above: reduced motion, `disabledWhen`, and descriptions. Keep each
effect's existing props, groups, labels, defaults and options exactly as they are. Don't add
new props (no `theme` / `mode`), don't rename or regroup.

---

## Per-effect rollout checklist

For each effect:

1. Read `index.tsx` and list which props only matter when another prop has a certain value.
   Add `disabledWhen` (rule 1) and the description suffix (rule 3).
2. Check the reduced-motion handling (rule 4). Add it if missing, including `data-pc-rm`
   support through `matchMedia`.
3. Decide: reducible, partly reducible, or not reducible.
   - Reducible / partly: flag the motion-only props with `hideWhenReducedMotion` (rule 2).
   - Not reducible: add or keep `reducedMotionNote` (rule 5), flag nothing.
4. Mirror any code change into `apps/docs/src/components/<slug>/index.tsx`.
5. Re-sync the registry (`md/new-component-workflow.md`, `update` flow) so `public/r` and
   `registry/index.json` pick up the new fields.
6. Check in the demo: toggle each parent prop and confirm dependents grey out; press `M`
   and confirm motion props disappear and the effect really stops moving.

The `props-remixer-audit` and `reduced-motion-audit` agents can check steps 1–3 per effect.
