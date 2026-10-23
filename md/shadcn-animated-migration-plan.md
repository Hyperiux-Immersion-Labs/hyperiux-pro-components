# shadcn-animated → Vault migration plan

Status, conventions and the remaining phases for bringing the 25 animated UI components from
the `shadcn-animated` (Hpx) project into Vault as free, publicly installable effects.

Last updated: 2026-10-23.

---

## Where we are

| Phase | What | Status |
|---|---|---|
| 0 | Port all 25 components to single files + Phase 0 demo pages | **Done** (type-check, lint and browser-load clean) |
| 1 | Review & QA each component | **In progress.** Polish standard (below) applied, and audit fixes done, for 5 of 25: Accordion, Attachment, Button, Chat Bubble, Checkbox Group. One owner decision open (see "Open items"). Components 14–25 (Input OTP → Tooltip) have polish steps 1, 3, 4 and 5 done; steps 2 and 6 and the audits are still to do (see "Progress on 14–25"). |
| 2 | Registry sync (`component-ship.mjs registry`) | **Done** for the 24 listed (Form Fields retired). v1.0.0, free, `components`. Free mirror **not** synced (`--skip-free-mirror`): `../hyperiux-components` had unrelated uncommitted changes |
| 3 | Codegen: global Remixer swap + Sanity JSX handoff | Global Remixer swap **done** (demos read `registry.json`). JSX written to `codegen/animated-*`; Sanity paste still manual |
| 4 | Distribution: `public/r`, npm tarball, free mirror | `public/r/animated-*.json` and `registry/dist` tarballs built. Free mirror and clean-project install test **to do** |
| 5 | Site listing (Sanity entries, detail pages, previews) | Not started |
| 6 | Launch, then maintenance | Not started |

The 24 listed components are in `registry/effects/components/animated-*/` and `public/r`. Their
demos use `RegistryRemixerDemo`, so **remixer props now live in `registry.json`**, not in
`DemoContent.tsx`. After editing a component, run `component-ship.mjs update --slug <slug>
--no-version-bump` (before launch) or with `--bump` (after). `port.mjs` no longer refreshes the
remixer panel; edit props in `registry.json`.

Release fixes (2026-10-23): Data Table `--hx` classes inside selectors replaced with a variable
redefinition; Theme Switch, Menubar and Tooltip `MotionConfig reducedMotion="user"` replaced with
an always/never wrapper; every exported `getThemeProps` defaults to dark (bundler too); Command
Menu default export renamed `AnimatedCommandMenu`. Button keeps `AnimatedButtonSet` because
`AnimatedButton` is its own named part. Tabs Bar stays light by its config.

---

## Decisions already made

These were agreed with the owner and should not be revisited without asking.

| Decision | Choice |
|---|---|
| File shape | **One self-contained `index.tsx` per component.** Every local helper it needs (button, popover, select, calendar, icons…) is inlined. No shared local imports. |
| Tier / category | `free`, category `components` |
| Naming | No `Hpx` anywhere. Default export `Animated<Name>`; compound parts exported by plain name (`Accordion`, `AccordionItem`…). |
| Remixer parity | Every control from the source demo's panel is exposed, starting from the **source's labels, groups and defaults**. The polish standard below then changes some of them on purpose: Mode defaults to dark, labels and groups are renamed where the source's were unclear, and controls that do nothing are removed. |
| Theme | Two remixer dropdowns on every component: **Theme** (`default`, `caffeine`, `claude`, `ghibli`, `spotify`, `valorant`, `vscode`) and **Mode** (`light`, `dark`). The theme also recolours the whole demo page. |
| External deps | npm packages are fine (installed by the user); local files are not. |
| Motion version | Stay on Motion 12. Drag-to-reorder is one axis (`"x"` or `"y"`); upgrading every shipped effect for 2-D drag in three components isn't worth the risk. |
| Corner radius | Keep the source's Tailwind classes as they are (`rounded-lg`, `rounded-xl`…). Corners follow the host project's radius scale, so our demos (where `rounded-lg` = 16px) look rounder than the source app. |
| Default mode | **Dark.** Every component and its remixer start in dark mode (see the polish standard). |
| Button: no Plain | Animated Button has no Plain background and no "Line under text" option. Link is its only bare look. |

---

## The pattern every component follows

A ported file always has this shape, top to bottom:

1. `"use client"` and **npm imports only** (no `@/…`, no `next/*`).
2. Inline helpers: `cn` (built on `tailwind-merge`), `slotAttr`.
3. `THEMES`: the 7 palettes × 2 modes, **only the tokens this file uses**, as `--hx-*` variables.
4. `themeProps(theme, mode)` → `{ "data-theme", style }`, plus `ThemeContext` and `ThemeScope`.
5. Inlined dependencies (button, popover…), then the main component.
6. The source demo, turned into the default export's body (sample data included).
7. Default export `Animated<Name>({ theme, mode, className, ...controls })`, then named exports, including `getThemeProps`.

### Rules

| Rule | Why |
|---|---|
| Theme colours are `--hx-*` variables (`bg-(--hx-popover)`), never bare tokens like `bg-popover` | Our own `globals.css` defines `--primary` (orange) and `--muted`; bare tokens would leak our site colours in. |
| Anything rendered in a portal (`*Portal`, `createPortal`) is wrapped in `<ThemeScope>` | Portals render outside the themed root. `ThemeScope` is a `display: contents` div carrying the variables. |
| Dark styles use `in-data-[theme=dark]:` not `dark:` | The mode comes from the component's own `data-theme`, not the user's `<html class="dark">`. |
| Default border/outline colours come from a zero-specificity `[:where(&,&_*)]` rule on the root | The source app set these globally in its base layer. |
| State variants are plain data variants: `data-open:`, `data-checked:`, `data-[orientation=vertical]:` | The source's custom `hpx-*` variants live in its `globals.css`, which users won't have. |
| Enter/exit animations use Base UI's `data-starting-style:` / `data-ending-style:` | Replaces `tw-animate-css` classes (`animate-in fade-in-0 zoom-in-95…`), which users may not have. |
| `Reorder.Group axis` is `"x"` or `"y"` only | Our repo is on Motion 12; `"xy"` is Motion 13. |
| Radius classes stay as Tailwind scale names (`rounded-lg`) | Owner's call: corners follow each project's own radius scale. Don't rewrite them to fixed values. |
| No server calls | Hover Card's link previews come from built-in sample data, not the source's `/api/link-preview` route. |
| No `next/*` | `next/link` → `<a>`; `next-themes` → a built-in `useTheme` that flips the component's own mode. |
| Sizes use Tailwind's scale (`p-6`, `text-lg`, `gap-4`), never viewport units (`p-[2vw]`, `text-[1.5vw]`) | The component sits in the user's layout, not a full-width page: viewport units scale with the browser window, not its container. Viewport sizing belongs only in our demo page (`DemoContent.tsx`), not in `index.tsx`. One exception: a full-screen overlay (a lightbox like Attachment's image preview) is sized against the window, so viewport units are right there. |
| Props that only work with another prop set get a `disabledWhen` rule (`{ prop: "fill", equals: false }`) | The remixer greys them out until they apply, instead of letting a change do nothing. Use it for any prop that is ignored while another prop has a given value. |

---

## Polish standard (do this for every component)

Apply all of this to each component during Phase 1, before its audits. The first five
(Accordion, Attachment, Button, Chat Bubble, Checkbox Group) already follow it; use them as
worked examples. Files: `src/components/<slug>/index.tsx` (the component) and
`src/app/(marketing)/demo/<slug>/DemoContent.tsx` (its remixer props).

### 1. Dark by default

Set `mode = "dark"` in **every** place a default mode is declared, not just one:

- the default export: `export default function Animated<Name>({ theme = "default", mode = "dark", … })`
- any inner component with its own `mode = "light"` default (Checkbox Group had two)
- `getThemeProps` / `themeProps` if it is exported with a mode default
- the `mode` prop in `DemoContent.tsx`: `default: "dark"`

Check with `grep -n 'mode = "light"\|mode: .* = "light"' index.tsx`; it should find nothing.

### 2. Theme colour

When a theme other than **Default** is chosen, the component's key accents take the theme's
`--hx-primary`. These include the main text it acts on, its icons and any line or indicator.
This also **overrides "muted" styling** (for example a `--hx-muted-foreground` icon).
**Default** keeps the source's neutral look.

- First check what already uses `--hx-primary`. Button, Attachment and Chat Bubble already
  coloured their main parts with it, so they needed no change, only an accurate Theme
  description.
- If the key parts use `--hx-foreground` / `--hx-muted-foreground` instead, add an `accent` flag
  that is `theme !== "default"`. Pass it down from the default export, and switch those classes
  to `--hx-primary` when it is set.
  - Accordion: the question, the icon and the hover line.
  - Checkbox Group: ticked labels, through a `--checkbox-marked-text` variable.
- Something drawn **on** a primary fill uses `--hx-primary-foreground`, not primary, so it stays
  readable.
- The Theme prop's description says what the theme recolours, for example *"Colour palette. Any
  theme but Default also tints the questions, icon and hover line."*

### 3. Tailwind sizes, not viewport units

Already in the Rules table above. In practice:

| Was | Now |
|---|---|
| `p-[2vw] max-md:p-[4vw]` | `p-6 max-md:p-4` |
| `text-[1.5vw] … max-md:text-[4.5vw]` | `text-lg max-md:text-base` |
| `min-h-[40vh] px-[4vw]` | `min-h-80 px-8 max-md:px-4` |
| `h-[75vh]` plus a `-46vw` bleed | `h-150 max-md:h-130` |

The only exception is a full-screen overlay (Attachment's image preview). Viewport sizing stays
allowed in `DemoContent.tsx`, because that is our page, not the shipped component.

### 4. Dependent props: `disabledWhen`

Any prop that does nothing while another prop has some value gets a rule. The remixer then
greys it out (40% opacity, not clickable), and it keeps its value for when it applies again.
**Don't remove the prop or hide it.** The source demos mark these with
`disabled: (v) => …` in their `controls` object; translate every one of them, then look for
more.

Format (plain JSON, so it can go into `registry.json` as is):

```ts
remixer: { …, disabledWhen: { prop: "fill", equals: false } }        // off while fill is off
remixer: { …, disabledWhen: { prop: "variant", notEquals: "card" } }  // only for the card variant
remixer: { …, disabledWhen: { prop: "variant", in: ["a", "b"] } }      // off for either value
remixer: { …, disabledWhen: [ruleA, ruleB] }                           // off if ANY rule matches
```

There is no "all of these" form yet. If a prop only works when A **and** B hold, say so in its
description instead.

Rules of thumb:

- **Grey out only what truly does nothing.** Check the code path before adding a rule.
  - Attachment's Stagger also spaces the fly-in, so it was wrongly tied to Animate enter.
  - Its Shake on error also fires for rejected files, so it was wrongly tied to Simulate failures.
- **Two settings that fight each other:** grey out the one that loses. Multiple open does
  nothing while Open on hover is on.
- **One control doing two jobs:** split it into two controls, each with its own rule. Accordion
  had one Roundness for the fill and the border. It now has Fill roundness (needs Fill) and
  Border roundness (needs Border).
- **A control that only exists for a removed option:** remove it too. Button's "Line under
  text" went with Plain.
- Number `select` options are currently sent as strings. See "Open items".

### 5. Descriptions

Every prop gets one short sentence saying **what it does**, written from the code, not the
label repeated.

- Lead with the effect: *"Draws a line under an item on hover and while it's open."*
- Units for numbers: *"How long opening and closing take, in seconds."*
- Name the dependency when there is one: *"… Needs Fill on."* or *"Not used by Link."*
- Name side effects a user wouldn't guess: *"Off on touch screens."* or *"Off while Open on
  hover is on."*
- Verify anything that isn't obvious by reading the code. "Blur until loaded" actually blurred
  while uploading, so it was relabelled. Chat replies use the theme's muted colour, not a primary
  tint.
- Rename a label when the source's is misleading (Show line → **Hover line**, Blur until loaded
  → **Blur while uploading**).
- Put a control in the group it belongs to. If a group would hold one control that just repeats
  the group's name, give the control its own group (the accordion's Icon).
- **No prop may keep the generated fallback.** The bundler uses the label as the description
  when the config has no `descriptions` entry, so a description that equals its label is a miss.
  Check with a script before calling a component done: list every prop whose description equals
  its label (or is under ~18 characters) and write a real one in the config's `descriptions`.
  The 8 bundled components after #5 (Command Menu to Hover Card) were filled this way.

### 6. Behaviour polish

Check each of these that applies:

- **Overshoot stays inside.** Elastic or spring animations that can overshoot (lines, fills)
  must not poke out of their container. Clip them with an `overflow-hidden` wrapper rather than
  removing the bounce (accordion hover line).
- **No doubled lines.** With an outer border on, the last item skips its own bottom divider.
- **Lines retract on close.** A hover line that stays drawn while open shrinks back on close,
  even if the pointer is still over it.
- **Touch screens.** Hover-only effects that misbehave under a finger are switched off for
  `pointerType === "touch"` (Button's Magnetic), and the description says so.
- **Feedback when something is refused.** Pair a visible message with motion: a shake for an
  error, a gentler nudge for "no more" (Checkbox Group's At most limit), skipped under reduced
  motion.
- **Validate early.** Reject bad input when it's added, not partway through a fake process.
  Attachment checks size and type on add, and the card fails with the reason, for example
  *"Over 10 MB · 14.2 MB"*. The limits are remixer controls.
- **Dialogs.** Escape closes the dialog, focus moves into it and stays there, `aria-modal="true"`
  is set, and focus returns to what opened it.
- **Demo tips follow the settings.** Any "Tip:" text under a demo reflects the chosen variant and
  options (Button's tip changes with the hover effect and the loading setting).
- **Useful defaults.** Demo-only states that show off the component start on (Button's loading
  state).

### 6a. Reduced motion

The demo header's **M** switch (and the OS setting) must make every component calm. Input OTP
is the reference implementation.

- **Read the setting yourself.** Motion's `useReducedMotion()` and `MotionConfig
  reducedMotion="user"` read the OS setting once and cache it, so they ignore the demo's
  switch. Use a small hook: `matchMedia("(prefers-reduced-motion: reduce)")` in state, set in
  an effect, with a `change` listener. The demo's Replay remounts the component, so the switch
  is picked up. Put the value in the component's context so every part can use it.
- **Gate everything that moves, by hand.** `MotionConfig` only stops transform and layout
  animations. Also gate: `pathLength` drawing (set the final value, `duration: 0`), height and
  clip-path changes, stagger and `delay` values (use 0), spinners, shakes and waves, and
  `animate-*` classes (`motion-reduce:animate-none`).
- **Content still appears, just instantly.** Characters, ticks, panels and success colours
  show their end state at once. Never hide information because motion is off.
- **Keep what isn't decoration.** A glide ring or highlight that shows where focus is stays;
  don't remove it under reduced motion unless it is purely ornamental. Decide this per
  component and say so in the prop's description.
- **CSS.** The themed root and the portal wrapper already carry
  `motion-reduce:**:transition-none`, so plain CSS transitions stop on their own.
- **Hide the motion-only props.** List props that only change motion (entry animation,
  stagger, bounce, duration, shake, wave) in the config's `hideWhenReducedMotion`. The panel
  leaves them out while reduced motion is on and brings them back when it's off. Don't list a
  prop that also changes something visible (colour, size, layout), and don't list one that
  other props depend on.
- **Test it.** Press **M**, open the panel (**P**): the listed props are gone. Use the
  component: nothing animates. Press **M** again: the props return. Run the
  `reduced-motion-audit` agent and fix what it finds.

### 7. Remixer panel (shared, already done)

These are global and need no per-component work. Don't undo them.

- Values on the right of each control are **capitalised**, not uppercase
  (`.fieldValue` in `remixer-panel.module.css`).
- `disabledWhen` support lives in `RemixerPanel.tsx`, `remixer-utils.ts` and `types.ts`. The greyed
  class goes on the field itself, never a wrapper, so the panel's `.field` child selectors keep
  their spacing and dividers.

### 8. Checks before calling a component done

```bash
cd apps/docs
npx tsc --noEmit -p tsconfig.json | grep animated-<name>
npx eslint src/components/animated-<name> "src/app/(marketing)/demo/animated-<name>"
grep -n 'from "@/\|from "next/\|hpx' src/components/animated-<name>/index.tsx   # nothing
grep -n 'vw\|vh\b\|svh' src/components/animated-<name>/index.tsx              # only a full-screen overlay
grep -n 'mode = "light"' src/components/animated-<name>/index.tsx             # nothing
# reduced motion: nothing animates with M on, motion-only props hidden (see 6a)
# no prop description may equal its label: grep the DemoContent props for description === label
```

Then run both audit agents on it (`reduced-motion-audit`, `props-remixer-audit`), fix what they
find, and open `/demo/animated-<name>` to try every control in light and dark, with Default and
one coloured theme.

### Progress on 14–25

Input OTP, Menubar, Questionnaire, Radio Group, Sidebar, Skeleton, Slider, Switch, Tabs Bar,
Theme Switch, Toast and Tooltip.

**These stay reproducible.** Unlike the first five (edited by hand), every change to the 11
bundled ones lives in its config in `apps/docs/scripts/shadcn-port/configs/`, so
`port.mjs <config>` regenerates the finished file. Keep it that way: put fixes in the config,
don't edit their `index.tsx` or `DemoContent.tsx` directly. Radio Group was ported by hand and
is the exception.

Config keys used for the polish (on top of those in "How to convert a component"):

| Key | Does |
|---|---|
| `defaultMode` | `"dark"`: default export, remixer Mode default and the Mode description |
| `descriptions` | `{ propName: "One sentence." }` |
| `labels` / `groups` | Rename a control's label or group |
| `disabledWhen` | Override the rule the bundler derives for a prop |
| `defaultTheme` / `defaults` | Starting theme, and `{ propName: value }` overrides for the other props' defaults |
| `options` | `{ propName: [{ label, value }] }`: the remixer dropdown's choices. The bundler reads them from the source, so patching the component's own schema is not enough |
| `hideWhenReducedMotion` | `["propName", …]`: props hidden from the panel while reduced motion is on (see 6a) |
| `omitProps` | `["propName", …]`: controls a patch removed from the demo, kept out of the remixer panel too |

**DemoContent.tsx is hand-owned once it exists.** Re-running the bundler only refreshes its `props={[…]}` list; title, subtitle, `width`, `panelClass` and layout/padding edits made in the file are kept. `page.tsx` is only written when missing. Change those in the file itself, not the config.
| `patches` | Exact `[from, to]` text replacements on the output (used for the viewport-unit fixes) |

The bundler now translates the source's `disabled: (v) => …` rules into `disabledWhen` itself:
`===`/`!==` → `equals`/`notEquals`, `!v.x` → `equals: false`, `||` → a list, and `&&` of
`!==` on one select → `in` the remaining options. Anything else (an `&&` across two props) is
printed as a warning and goes into the description instead.

| Step | State |
|---|---|
| 1. Dark by default | Done for all 12 |
| 2. Theme colour | Done. Root and portals get `data-accent` when the theme isn't Default; key parts use `in-data-accent:…-(--hx-primary)`. Added to Input OTP (active box, ring, caret), Tabs Bar (active text with underlines), Tooltip (Outline style), Theme Switch (icon) and Toast (timer bar). The other six already used `--hx-primary`; every Theme description now says what it tints |
| 3. Tailwind sizes | Done. Only Toast keeps `vh`, which positions its fixed, full-screen stack (allowed exception). Questionnaire's slide distance is now `%` of its own width instead of `vw` |
| 4. `disabledWhen` | Done: 35 rules from the source. Two `&&` cases are in descriptions instead (Tabs Bar Bounce, Tooltip Bounce). Sidebar and Theme Switch have none |
| 5. Descriptions | Done for every prop; two labels renamed (Success wave, Smooth) |
| 6. Behaviour polish | **To do** |
| Audits | Done on all 12. All props-audit fixes applied (rules, descriptions, Toast timeout min 0, Questionnaire card-only rules). Reduced motion: CSS transitions now stop under the themed root and portals (`motion-reduce:**:transition-none`). **Still open** (code changes): Toast and Theme Switch need `MotionConfig`; Toast's drawn check and spinner; ungated `pathLength`, `height` and stagger/delay in Menubar and Questionnaire (Input OTP, Radio Group and Sidebar are done: own reduced-motion hook, `MotionConfig` always/never, motion-only props hidden). Re-run `reduced-motion-audit` for exact lines |

Fixed along the way:

- **Global CSS the components relied on.** Skeleton's shimmer (`skeleton-sweep`, also bundled in
  Sidebar), Toast's timer bar (`toast-timer` keyframes) and Input OTP's caret (`caret-blink`, from
  `tw-animate-css`) only existed in the source app's CSS, so they silently did nothing. The bundler
  now detects them, renames them `hx-…` and ships the CSS inside the file (`COMPONENT_CSS`,
  rendered as a `<style>` by the default export). **Data Table (#7) still has the shimmer bug**;
  it wasn't regenerated because it's outside 14–25.
- **Sidebar's Elastic tooltips** now set `transitionDuration` / `transitionTimingFunction`
  (they set animation timing, which the bundler's enter transitions don't read).

### Progress on 1–13 (synced to the 14–25 standard)

**6–13** (Command Menu, Data Table, Date Picker, Dialog, Drawer, Dropdown Menu, Form Fields,
Hover Card) are bundled, so everything is in their configs:

| Step | State |
|---|---|
| 1. Dark by default | Done (`defaultMode: "dark"`) |
| 2. Theme colour | Theme descriptions written from what already uses `--hx-primary`. No new `data-accent` tints yet; Hover Card's link and underline still use foreground (**to do**) |
| 3. Tailwind sizes | Done. Demo containers lose `vh`/`vw` and their border; Data Table's phone bleed (`94vw`, `150vw`) is now a `min-w-3xl` table that scrolls inside its box. Drawer keeps `vh` on the open panel and the page-shrink effect (full-screen overlay, allowed) |
| 4–5. Rules, descriptions | Done (descriptions earlier; rules come from the bundler) |
| 6a. Reduced motion | Done through the bundler (below) plus `hideWhenReducedMotion` lists |
| Data Table shimmer | Fixed (regenerated, so `hx-skeleton-sweep` now ships in the file) |
| Audits | **To do**: run `reduced-motion-audit` and `props-remixer-audit` on all 8 |

**The bundler now does §6a itself** for every component that imports `motion/react`:
`useReducedMotion()` becomes `usePrefersReducedMotion()`, `<MotionConfig reducedMotion="user">`
becomes `<ReducedMotionConfig>` (always/never), the default export is wrapped in it, and the
themed root also stops CSS transitions and animations under the demo's switch
(`in-data-pc-rm:**:…`). Per-component patches are only needed for motion that isn't a transform
(height, `pathLength`, delays).

**1–5** (hand-edited, never regenerated) got the same change by hand: the hook, `ReducedMotionConfig`
(Button had no `MotionConfig` at all), the CSS stop on the root (not Checkbox Group, whose root
differs), `hideWhenReducedMotion` in each `DemoContent`, centred tips, and no border on
Attachment's demo container.

**Warning: some 14–25 files are no longer reproducible.** Commit `6edfeb8c` hand-edited files
that the configs don't describe (Sidebar and Toast demo sizing, Questionnaire), and the
Menubar, Tooltip and Theme Switch configs have patches that no longer match the bundler's
output. Running `port.mjs` on any of these overwrites or fails. Fold those edits back into the
configs before regenerating them.

### Open items for the first five

The audit fixes for the first five are done:
- the remixer `select` now keeps number options as numbers
- the missing and wrong rules and descriptions are fixed
- the reduced-motion gaps are closed in all five

Still open:

- **Checkbox Group, Drag to reorder:** it uses `axis="y"`, but the inline layout is a wrapping
  row and Cards is a two-column grid. It probably only reorders properly in single-column
  layouts (phones). **Needs an owner decision:** sideways drag for the inline layout, or grey it
  out except in single-column layouts.
- **Chat Bubble's named parts used on their own** (a bare `Bubble` outside the default export)
  get no `MotionConfig`. The default export now wraps everything in one, so the shipped demo is
  covered.
- **Not possible from the CLI:** the 1440 / 1024 / 390 and Firefox / Safari pass needs a browser
  session, and the real install test needs Phase 2.

### Lessons from the first five's audits

Check these on every remaining component:

- **No global utility classes.** Attachment used a `shimmer` class that only existed in the
  source app's global CSS, so Shimmer text silently did nothing. Any class the component relies
  on must be standard Tailwind or defined inside the file. Attachment now injects its own
  `@keyframes` with a `<style>` tag. Write such classes out in full; Tailwind can't see classes
  built with template strings.
- **Reduced motion beyond `MotionConfig`.** `MotionConfig reducedMotion="user"` only stops
  transform and layout animations. Handle each of these yourself with `useReducedMotion()` or
  `motion-reduce:`:
  - `height`, `clipPath`, `pathLength`, `borderRadius` and `strokeDashoffset` animations
  - imperative `animate(el, …)` calls, GSAP tweens and `repeat: Infinity` loops
  - manual springs (`useSpring` / `useVelocity`)
  - `scrollTo({ behavior: "smooth" })`
  - every CSS `transition-*`, which needs `motion-reduce:transition-none`
  - stagger and delay values (zero them, or the content just waits)
- **`MotionConfig` reach.** Wrap the default export's whole body. Give any named part that can
  be used on its own its own `MotionConfig`, as Checkbox Item now does.
- **No `--hx-*` classes inside selectors.** The bundler turns the source's
  `[&_.text-muted-foreground]:…` into `[&_.text-(--hx-muted-foreground)]:…`. Brackets aren't
  valid in a CSS class selector, so the production build warns ("Expected identifier in class
  selector") and the rule doesn't work. Redefine the variable on the parent instead, for example
  `[--hx-muted-foreground:color-mix(in_oklab,var(--hx-primary-foreground)_70%,transparent)]` (Data
  Table rows). To check: `grep -n '_\.[a-z-]*-(--hx' index.tsx` should find nothing.
- **Number dropdowns.** The remixer keeps option types now, but still compare numbers loosely in
  components if they can also come from user code.

---

## How to convert a component

The conversion is automated. The bundler lives in `apps/docs/scripts/shadcn-port/`.

```bash
# Source location (defaults to ~/Downloads/shadcn-animated/src)
export SHADCN_ANIMATED_SRC=~/Downloads/shadcn-animated/src

cd apps/docs
node scripts/shadcn-port/port.mjs scripts/shadcn-port/configs/<name>.json
```

It writes `src/components/<slug>/index.tsx` and, when the config has a `title`,
`src/app/(marketing)/demo/<slug>/page.tsx` + `DemoContent.tsx`.

### Config file

```json
{
  "slug": "animated-dialog",
  "exportName": "AnimatedDialog",
  "main": "components/ui/dialog.tsx",
  "demos": ["app/components/(default)/dialog/dialog-demo.tsx"],
  "demoFn": "HpxDialogDemo",
  "title": "Animated Dialog",
  "subtitle": "A window over the page that asks for a decision before you carry on."
}
```

Optional keys: `deps` (overrides automatic dependency resolution), `patches`
(`[from, to]` string pairs applied to the output, for one-off fixes), `schemaPrelude`
(code the controls schema needs that isn't a demo constant, e.g. an npm import),
`extraDemo` (wrapper code when the demo needs composing, see `sidebar.json`),
`panelClass`, `width`.

### What the bundler does

1. Resolves local imports recursively and orders them dependencies-first.
2. Inlines them, merging npm imports and renaming clashing top-level names.
3. Rewrites classes: tokens → `--hx-*`, `hpx-*` variants → data variants, `tw-animate` → Base UI styles, `dark:` → `in-data-[theme=dark]:`.
4. Strips `Hpx`/`hpx`/`HPX_` from every name.
5. Turns the demo's `useHpxControls(controls)` into props with the same defaults (`set()` still works).
6. Wraps portals in `ThemeScope`, applies `patches`, removes unused code.
7. Generates the draft remixer props (Theme, Mode, then every source control).

### After running it, always

```bash
npx tsc --noEmit -p tsconfig.json | grep animated-
npx eslint src/components/<slug> "src/app/(marketing)/demo/<slug>"
```

Then open `/demo/<slug>` and check the manual review list below. A first visit compiles the
route in dev and can take 15+ seconds, followed by one full reload. Wait for that before
judging the page; the `DemoHeader` Controls tab only behaves normally after it.

### Manual review (things the bundler can't judge)

- [ ] No `@/`, `next/`, `hpx` left: `grep -n 'from "@/\|from "next/\|hpx' index.tsx`
- [ ] No viewport units in the shipped file: `grep -n 'vw\|vh\b\|svh' index.tsx`
- [ ] Every prop that only works alongside another prop has a `disabledWhen` rule
- [ ] Every popup (menu, popover, select, tooltip, dialog, drawer, toast) is themed in **dark mode** and in a coloured palette
- [ ] The demo's own heading was removed (our page renders its own)
- [ ] Nothing sits under the source site's navbar offset (`top-14`, `100svh-3.5rem`…)
- [ ] Interactions work: open/close, drag, keyboard, swipe
- [ ] `fixed` elements behave inside the demo frame (see `sidebar.json` for the transform trick)

---

## Phases to public release

### Phase 1 – Review & QA (per component)

Start by applying the **Polish standard** above to the component. Then run `md/section-qc-checklist.md` sections 2–9 and 13 on it. Points specific to this batch:

1. **Descriptions.** The generated remixer descriptions are just the control labels. Write a real one-line description for each prop (these become the docs props table).
2. **Reduced motion.** Most components wrap in `MotionConfig reducedMotion="user"`. Toast does not, a gap carried over from the source. Run the `reduced-motion-audit` agent.
3. **Remixer.** Run the `props-remixer-audit` agent against each demo.
4. **Responsive.** Check 1440 / 1024 / 390 widths. Source layouts use `max-[1025px]:` and `max-md:`, which is fine for demos.
5. **Cross-browser.** Chromium and WebKit were spot-checked during the port; still do Firefox and real Safari.
6. **Ownership/licensing.** Confirm the source project is ours to publish (Hpx = Hyperiux). Every npm dependency is MIT/ISC; record them per section 11 of the QC checklist.

**Exit criteria:** checklist signed off, descriptions written, no console errors.

### Phase 2 – Registry sync

Per component (see `md/new-component-workflow.md` Phase 1):

```bash
node scripts/component-ship.mjs registry --slug animated-<name> \
  --category components --tier free \
  --title "Animated <Name>" --description "<one line>"
```

- Props are drafted from the `props={[…]}` literal in `DemoContent.tsx`. Keep that literal plain JSON-like: the script evaluates it, and its regex stops at the first `]}`.
- Check `registry.json` → `dependencies` lists every npm package in the inventory table below.
- Free tier also syncs into `../hyperiux-components`. Make sure that repo is clean first.

**Exit criteria:** `registry/effects/components/animated-*/` exists for all 25; `public/r/<slug>.json` embeds full source.

### Phase 3 – Codegen

```bash
node scripts/component-ship.mjs codegen --slug animated-<name>
```

- Swaps `LocalRemixerDemo` → `RegistryRemixerDemo` and adds the `registry.json` import to `page.tsx`. Our demos pass `render={…}` rather than `component`; check the swap keeps it.
- Paste the generated type-stripped JSX into Sanity Studio by hand.

### Phase 4 – Distribution

There are two pipelines, and both must be updated. They read different files, so updating one doesn't update the other:

1. `public/r/*.json`: built from each `registry.json`, written by Phase 2.
2. npm tarballs in `registry/dist`: built with `npm pack` from each `package.json`. Refresh with `component-ship.mjs update --slug <slug> --no-version-bump` (it also reorders `dist/registry-index.json`), or `npm run build:registry:dist`.

Then **test a real install** in a clean Next.js + Tailwind v4 project, with no shadcn and no `tw-animate-css`:

```bash
npx hyperiux add animated-<name>
npm i <deps from the table below>
```

The component must render, theme (including popups) and animate with nothing else configured.

### Phase 5 – Site listing

- Sanity effect entries (title, category, description, preview media), via the manual Sanity step.
- Effect detail pages and thumbnails/preview videos.
- `getDemoPageMetadata` currently falls back to the slug; confirm titles once Sanity entries exist.

### Phase 6 – Launch & maintenance

- Release in batches (suggested order in the inventory table), not all 25 at once, so install and limit tracking issues surface early.
- When the source project changes: re-run `port.mjs` for the component, review the diff, then `component-ship.mjs update` with a version bump per `md/versioning.md`.

---

## Component inventory

All are `free`, category `components`. "Deps" are the npm packages the single file imports
(`react` and `react-dom` are assumed). Every file except Radio and Checkbox also needs
`tailwind-merge`, which is left out of the column.

| Component | Slug | Lines | Remixer props | Deps | Batch |
|---|---|---|---|---|---|
| Radio Group | `animated-radio-group` | 655 | 12 | motion | 1 |
| Checkbox Group | `animated-checkbox-group` | 967 | 20 | motion | 1 |
| Switch | `animated-switch` | 776 | 12 | @base-ui/react, motion | 1 |
| Tabs Bar | `animated-tabs-bar` | 821 | 15 | @base-ui/react, motion | 1 |
| Slider | `animated-slider` | 1,327 | 18 | @base-ui/react, motion | 1 |
| Accordion | `animated-accordion` | 914 | 15 | @base-ui/react, motion | 1 |
| Tooltip | `animated-tooltip` | 1,019 | 16 | lucide-react, motion | 1 |
| Button | `animated-button` | 1,539 | 16 | lucide-react, motion | 1 |
| Skeleton | `animated-skeleton` | 777 | 10 | @base-ui/react, cva, lucide-react, motion | 2 |
| Dialog | `animated-dialog` | 1,007 | 16 | @base-ui/react, cva, lucide-react, motion | 2 |
| Drawer | `animated-drawer` | 1,039 | 13 | @base-ui/react, cva, motion | 2 |
| Hover Card | `animated-hover-card` | 942 | 12 | @base-ui/react, cva, lucide-react, motion | 2 |
| Input OTP | `animated-input-otp` | 945 | 11 | @base-ui/react, cva, input-otp, lucide-react, motion | 2 |
| Theme Switch | `animated-theme-switch` | 689 | 7 | @base-ui/react, cva, gsap, lucide-react, motion | 2 |
| Toast | `animated-toast` | 1,363 | 18 | @base-ui/react, cva, lucide-react, motion | 2 |
| Dropdown Menu | `animated-dropdown-menu` | 1,824 | 18 | @base-ui/react, cva, gsap, motion | 3 |
| Command Menu | `animated-command-menu` | 1,377 | 17 | @base-ui/react, cmdk, cva, lucide-react, motion | 3 |
| Chat Bubble | `animated-chat-bubble` | 2,091 | 20 | @base-ui/react, cva, lucide-react, motion | 3 |
| Attachment | `animated-attachment` | 1,647 | 21 | @base-ui/react, @gsap/react, cva, gsap, lucide-react, motion | 3 |
| Date Picker | `animated-date-picker` | 1,763 | 24 | @base-ui/react, cva, date-fns, lucide-react, motion, react-day-picker | 3 |
| Form Fields | `animated-form-fields` | 2,291 | 10 | @base-ui/react, cva, gsap, libphonenumber-js, motion, zod | 4 |
| Menubar | `animated-menubar` | 2,942 | 24 | @base-ui/react, lucide-react, motion | 4 |
| Questionnaire | `animated-questionnaire` | 2,867 | 18 | @base-ui/react, cva, motion | 4 |
| Data Table | `animated-data-table` | 2,622 | 34 | @base-ui/react, cva, gsap, lucide-react, motion | 4 |
| Sidebar | `animated-sidebar` | 4,043 | 15 | @base-ui/react, cva, lucide-react, motion | 4 |

`cva` = `class-variance-authority`. Batches go from fewest dependencies and simplest
behaviour (1) to the largest, most composed components (4).

Versions installed in `apps/docs` for this work: `@base-ui/react@1.8.0`,
`react-day-picker@10.0.1`, `date-fns@4.4.0`, `class-variance-authority@0.7.1`,
`cmdk@1.1.1`, `input-otp@1.5.0`, `libphonenumber-js@1.13.14`.

---

## Known gaps

Motion version and corner radius are decided; see "Decisions already made".

| Item | Detail | Owner decision needed? |
|---|---|---|
| Remixer descriptions | Written for every bundled component (6–25). Components 1–5 and any new port still need the label-equals-description check. | No |
| Hover Card previews | Built-in sample data; `loadPreview()` is the swap point for a real endpoint. | No |
| Theme Switch | Flips the component's own mode, not the user's site theme. Document how to wire it to their theme provider. | No |
| File size | Sidebar is ~4k lines (≈1.3k are its 9 demo icons). Consider trimming demo-only icons from the shipped file. | Maybe |
| `getThemeProps` export | Extra public API so pages can match the palette. Keep, and document it. | No |
| Toast reduced motion | Not handled in the source either. | No, fix in Phase 1 |
| Dev first-load | First visit to a route compiles for 15+ s, then reloads once; production builds don't do this. | No |

## Related

- `md/new-component-workflow.md`: ship pipeline phases
- `md/section-qc-checklist.md`: QC checklist used in Phase 1
- `md/versioning.md`: version bumps and the CLI lock file
- `md/remixer-panel.md`, `md/remixer-effect-props.md`: remixer prop format

## Animated Form Fields: retired (2026-10-23)

Its motion (error slide/fade, shake on error, success tick, character counter, staggered entrance) was ported into the sold `animated-form` component (v1.1.0). `animated-form-fields` is unlisted from `/demo/shadcn-animated`; its files and config are kept but it is not maintained.
