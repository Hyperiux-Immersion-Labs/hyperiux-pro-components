# `prefers-reduced-motion` Audit — LandingPageNew

Scope: every component imported in `src/components/LandpageV2/LandingPageNew.jsx`

---

## Already Handled (2)

| Component | What's done |
|-----------|-------------|
| **UIKit** | `matchMedia` splits desktop (scrub scroll) vs mobile (one-shot fade) |
| **Loader** | Skipped entirely on `innerWidth < 1025` (mobile) |

---

## Needs Changes (17)

---

### 🔴 High Impact — Complex Motion, Vestibular Risk

#### `FeaturedStoryTelling` (desktop) / `StoryTellingMoble` (mobile)

- Cards spiral/orbit outward in arcs with scale + blur + rotation scrubbed to a full scroll section
- SplitText masked line wipes for text reveals/exits

**With reduced-motion:**
- Skip the spiral math entirely — cards appear in place at their final resting position
- Text reveals become instant opacity fades instead of masked line wipes

```js
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReduced) {
  gsap.set(cards, { opacity: 1, scale: 1, x: 0, y: 0, filter: "none" });
  gsap.set(textLines, { opacity: 1, yPercent: 0 });
  return;
}
// ... existing spiral animation code
```

---

#### `SmallMotion`

- SplitText per-character 3D flip (`rotationX`, `yPercent`, `filter: blur`) scrubbed to scroll

**With reduced-motion:**
- Skip `rotationX` and `yPercent`
- Fade text in as a whole block with `opacity` only (no 3D transform)

```js
if (prefersReduced) {
  gsap.set(chars, { opacity: 1 });
  return;
}
```

---

#### `GradientFill`

- Three text blocks animate `rotationX: -30 → 0 → +30` with `yPercent: 200 → 0 → -200` scrubbed to scroll
- Radial glow scales from `1.5` up to `3.2` (desktop) / `2.5` (mobile)

**With reduced-motion:**
- Text fades in/out with opacity only — no `rotationX`, no `yPercent` travel
- Glow can remain visible but skip the scale + positional movement

```js
if (prefersReduced) {
  gsap.set(textBlocks, { opacity: 1 });
  gsap.set(glow, { scale: 1.5, opacity: 1 });
  return;
}
```

---

#### `Hero`

- Random character stagger with `filter: blur` on load, driven by GSAP timeline that fires after loader completes
- Vault element reveals via `yPercent` and paragraph line-by-line reveals

**With reduced-motion:**
- Skip char stagger + blur
- Fade the whole heading block in as one unit (`opacity: 0 → 1`)

```js
if (prefersReduced) {
  gsap.set([heading, vault, paragraph, buttons], { opacity: 1, y: 0, filter: "none" });
  return;
}
```

---

#### `Loader`

- Canvas pixel dissolution + logo clipPath sequence + strip `scaleX` on page load
- Currently skipped on mobile (`innerWidth < 1025`) — same logic should apply to reduced-motion

**With reduced-motion:**
- Skip the loader entirely; fire the `heroReady` event immediately

```js
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReduced || window.innerWidth < 1025) {
  document.dispatchEvent(new Event("heroReady"));
  return;
}
// ... existing loader animation
```

---

### 🟠 Medium Impact — Scroll-Scrubbed Transforms

#### `Tension`

- 7 cards stack via `y` position changes on scroll
- SVG check/X icons draw in via `drawSVG` plugin

**With reduced-motion:**
- Cards appear at full opacity already stacked; no y-position animation
- SVG paths are fully drawn from the start (no drawSVG)
- Scroll only changes z-index / active state

```js
if (prefersReduced) {
  gsap.set(cards, { opacity: 1, y: 0 });
  gsap.set(svgPaths, { drawSVG: "100%" });
  return;
}
```

---

#### `WorkFlow`

- Accordion steps expand/collapse scrubbed to scroll (`OPEN_HEIGHT` / `CLOSED_HEIGHT`)
- Connecting lines fill via `scaleY` on scroll
- Video reveals via `clipPath inset` animation

**With reduced-motion:**
- All steps start fully open with no height animation
- Lines are fully visible (`scaleY: 1`)
- Video is fully visible (no clipPath)
- Scroll only changes the active/highlighted step

```js
if (prefersReduced) {
  gsap.set(steps, { height: OPEN_HEIGHT, opacity: 1 });
  gsap.set(lines, { scaleY: 1 });
  gsap.set(videos, { clipPath: "inset(0% 0% 0% 0%)" });
  return;
}
```

---

#### `ForDevelopers`

- 5 vertical strips animate `yPercent: 100 → -100` over a long scroll pin
- Heading uses `MaskTextReveal` (masked line wipe)

**With reduced-motion:**
- Strips sit statically in their natural layout position
- `MaskTextReveal` becomes a plain opacity reveal

```js
if (prefersReduced) {
  gsap.set(strips, { yPercent: 0, opacity: 1 });
  return;
}
```

---

#### `TrustStrip`

- Two stat card strips scrub with opposite `yPercent` values for a parallax effect
- Paragraph text moves at a third rate

**With reduced-motion:**
- Remove the ScrollTrigger entirely; strips sit at natural scroll position

```js
if (prefersReduced) return; // skip ScrollTrigger setup entirely
```

---

#### `Pricing`

- `PriceDigit` component scrolls through digit values via `y` position animation (slot machine effect)
- Section fades in with responsive `start` offsets

**With reduced-motion:**
- Price digits show final value immediately (no digit-scroll)
- Section appears at full opacity instantly

```js
if (prefersReduced) {
  gsap.set(section, { opacity: 1 });
  gsap.set(digitSlots, { y: finalPosition });
  return;
}
```

---

### 🟡 Low Impact — Subtle or Ambient

#### `CTA`

- 75 vertical lines pulse opacity forever (`repeat: -1`, `yoyo: true`) — desktop only
- Already excluded on mobile via `matchMedia`

**With reduced-motion:**
- Kill the repeating timeline; lines sit at full opacity

```js
if (!prefersReduced) {
  tl.to(lines, { opacity: 0.15, stagger: 0.04, repeat: -1, yoyo: true });
}
// otherwise: lines remain at default opacity, no animation
```

---

#### `FAQs`

- Gradient background moves `y: -15vw` on scroll (subtle parallax behind FAQ list)

**With reduced-motion:**
- Remove the ScrollTrigger; gradient stays at its initial position

```js
if (prefersReduced) return;
```

---

#### `GlowingPlatesDeferred` (Three.js WebGL)

- Continuous 3D WebGL scene running in a render loop — GPU load regardless of visibility

**With reduced-motion:**
- Don't mount the component at all; render nothing (or a static image)

```jsx
const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
if (prefersReduced) return null;
return <GlowingPlates />;
```

---

#### `Footer` — `FlowFieldHero` (GLSL shader WebGL)

- Continuous GPU flow field animation running in a canvas loop
- Desktop already shows WebGL; mobile already shows a static image

**With reduced-motion:**
- Apply the same pattern as mobile — show the static image instead of mounting the WebGL canvas

```jsx
const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
// already: isMobile → static image
// add:     prefersReduced → static image
return (prefersReduced || isMobile)
  ? <img src="/footer-bg.jpg" ... />
  : <FlowFieldHero />;
```

---

#### `Problem` / `Solution` / `VaultGridMobile`

Delegate animation to `RandomBlur`, `TextFillAnimation`, `useFadeUp` sub-components respectively. Fix is the same pattern in each sub-component:

**With reduced-motion:**
- Replace scroll-driven motion with a simple `opacity: 0 → 1` reveal (or skip entirely)

---

## Summary Table

| Component | Motion Type | Risk | Already Handled |
|-----------|-------------|------|-----------------|
| FeaturedStoryTelling | Spiral orbit, 3D, blur, scrub | 🔴 High | No |
| StoryTellingMoble | Rotating circle, masked text, scrub | 🔴 High | No |
| SmallMotion | Per-char 3D flip, blur, scrub | 🔴 High | No |
| GradientFill | 3D text rotation, yPercent travel | 🔴 High | No |
| Hero | Char stagger + blur on load | 🔴 High | No |
| Loader | Canvas pixel dissolve on load | 🔴 High | Partial (mobile only) |
| Tension | Card stack, drawSVG, scrub | 🟠 Medium | No |
| WorkFlow | Accordion scrub, clipPath, scaleY | 🟠 Medium | No |
| ForDevelopers | Strip yPercent, mask text | 🟠 Medium | No |
| TrustStrip | Parallax yPercent, scrub | 🟠 Medium | No |
| Pricing | Digit slot scroll, fade-in | 🟠 Medium | No |
| UIKit | Card slide + container translate | 🟠 Medium | Partial (mobile only) |
| CTA | Infinite opacity pulse loop | 🟡 Low | Partial (mobile only) |
| FAQs | Background parallax | 🟡 Low | No |
| GlowingPlatesDeferred | Continuous WebGL loop | 🟡 Low | No |
| Footer (FlowFieldHero) | Continuous WebGL shader | 🟡 Low | Partial (mobile only) |
| Problem | RandomBlur (delegate) | 🟡 Low | Unknown |
| Solution | TextFillAnimation (delegate) | 🟡 Low | Unknown |
| VaultGridMobile | useFadeUp (delegate) | 🟡 Low | Unknown |

---

## Implementation Priority

1. **Loader** — runs on every page load before anything else is visible
2. **Hero** — first animated content users see
3. **FeaturedStoryTelling / StoryTellingMoble** — most complex motion, highest vestibular risk
4. **SmallMotion + GradientFill** — `rotationX` 3D flip is the most disorienting effect
5. **CTA** — infinite loop consuming GPU/compositor resources permanently
6. **GlowingPlates + Footer WebGL** — continuous GPU load for users who opt out of motion
7. **Everything else** — TrustStrip, FAQs, Pricing, Tension, WorkFlow, ForDevelopers, UIKit

---

## Shared Utility Pattern

To avoid repeating `window.matchMedia(...)` in every component, create a shared hook:

```js
// src/hooks/usePrefersReducedMotion.js
import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setPrefers(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefers;
}
```

For GSAP components that read it inside `useEffect` (not React render), use the raw `matchMedia` call directly — no hook needed:

```js
useEffect(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) { /* set final states, return */ }
  // ... animation setup
}, []);
```
