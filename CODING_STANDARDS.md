# Coding Standards - Hyperiux Components

> **Who is this for?** Any dev (including AI agents) writing or reviewing code in this repo.
> **Why does it exist?** So every component feels like the same person wrote it.
>
> All component code is TypeScript: registry effects live in `registry/effects/<category>/<slug>/index.tsx` and their docs-site mirrors in `apps/docs/src/components/<slug>/index.tsx`. Examples below are TS/TSX. Responsive and site-page styling rules are covered in more depth in `apps/docs/STYLE_GUIDE.md`.

---

## Core Principles

1. **Readable > Clever** - If you need 10 seconds to understand a line, rewrite it.
2. **Name things clearly** - Variables describe *what* they are, not where they came from.
3. **Comments explain *why*, not *what*** - Code shows what. Comments explain intent.
4. **Dead code is noise** - Unused variables, attributes, and handlers must be removed before merging.
5. **Don't repeat yourself** - Extract any logic that appears more than twice.
6. **CSS via layout semantics** - Use `gap`, `flex-col`, `space-y` over `mb-*`/`mt-*` for spacing between siblings.

---

## 1. File Structure

Every component file should follow this top-to-bottom order:

```
"use client" (if needed)

Imports

──── Constants ────────────────
Module-level constants (sentinel values, speeds, magic numbers)

──── Shaders / Templates ──────
GLSL strings, template literals, static data that doesn't change

──── Types ────────────────────
Prop interface (`export interface ThingProps { ... }`), internal types

──── Component ────────────────
export default function ...

  ── State & Refs
  ── Effects (with internal sections commented)
  ── Derived values (stats, computed lists)
  ── Return (JSX)
```

Use simple one-line section comments inside long functions:

```ts
// Renderer and scene
// Mouse state
// Grid layout
// Animation loop
// Cleanup
```

Keep section headers consistent and plain. Do not draw lines or use decorative divider characters in comments. Use words only.

---

## 2. Naming Conventions

### Variables

| Pattern | Use for |
|---------|---------|
| `SCREAMING_SNAKE_CASE` | Module-level constants, sentinel values, speeds |
| `camelCase` | Everything else |
| `PascalCase` + `Props` | Exported prop interfaces (`MossGridProps`, `NeonStreakProps`) |
| `onEventName` | Event handlers (`onMove`, `onEnter`, `onResize`). `handleEventName` is also common in existing code, especially for JSX handlers; match the file you are in |

### Magic Numbers → Named Constants

**Bad:**
```ts
const mouse = new THREE.Vector2(-9999, -9999);
if (smoothMouse.x > -9000) { ... }
```

**Good:**
```ts
const MOUSE_OFFSCREEN = -9999;
const MOUSE_THRESHOLD = -9000; // anything above this = mouse is on screen

const mouse = new THREE.Vector2(MOUSE_OFFSCREEN, MOUSE_OFFSCREEN);
if (smoothMouse.x > MOUSE_THRESHOLD) { ... }
```

> Put all constants at the top of the file, **outside** any function or effect.

### Booleans

Name them as questions:

```ts
// Bad
let mouseState = false;

// Good
let mousePresent    = false;
let mouseJustEntered = false;
```

---

## 3. Functions & Helpers

### Extract repeated guards

If the same condition check appears more than twice, extract it:

**Bad:**
```ts
const onMove  = (e: PointerEvent) => { if (window.innerWidth < 768) return; ... };
const onEnter = (e: PointerEvent) => { if (window.innerWidth < 768) return; ... };
const onLeave = ()                => { if (window.innerWidth < 768) return; ... };
```

**Good:**
```ts
const isDesktop = (): boolean => window.innerWidth >= 768;

const onMove  = (e: PointerEvent) => { if (!isDesktop()) return; ... };
const onEnter = (e: PointerEvent) => { if (!isDesktop()) return; ... };
const onLeave = ()                => { if (!isDesktop()) return; ... };
```

### Prefer early returns over deep nesting

**Bad:**
```ts
for (let i = 0; i < count; i++) {
  if (d < threshold) {
    // 10 lines of logic...
  }
}
```

**Good:**
```ts
for (let i = 0; i < count; i++) {
  if (d >= threshold) continue; // skip anything outside range
  // 10 lines of logic, now at a flat level
}
```

### Name all inline functions

Event listeners especially - named functions can be properly removed in cleanup.

**Bad:**
```ts
mount.addEventListener("touchend", () => {
  mousePresent = false;
  setActive(false);
});
// Can't remove this in cleanup!
```

**Good:**
```ts
const onTouchEnd = () => {
  mousePresent = false;
  setActive(false);
};
mount.addEventListener("touchend", onTouchEnd);

// In cleanup:
mount.removeEventListener("touchend", onTouchEnd);
```

---

## 4. GLSL / Shaders

### Always extract to named constants

GLSL strings belong **outside** the component function, at module level. Inline shaders inside `ShaderMaterial` make the file unreadable.

**Bad:**
```ts
const mat = new THREE.ShaderMaterial({
  vertexShader: `
    uniform float uSize;
    void main() { ... }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    void main() { ... }
  `,
});
```

**Good:**
```ts
// At module level, before the component:
const MY_VERT = /* glsl */ `
  uniform float uSize;

  void main() {
    ...
  }
`;

const MY_FRAG = /* glsl */ `
  uniform vec3 uColor;

  void main() {
    ...
  }
`;

// Inside the component:
const mat = new THREE.ShaderMaterial({
  vertexShader:   MY_VERT,
  fragmentShader: MY_FRAG,
});
```

### Name shaders descriptively

| Pattern | Example |
|---------|---------|
| `THING_VERT` | `PARTICLE_VERT`, `CURSOR_VERT` |
| `THING_FRAG` | `POINT_FRAG`, `LINE_FRAG` |
| Shared fragment | `POINT_FRAG` (used by both particle and cursor mat) |

Existing effects also use `THING_VS` / `THING_FS` (e.g. `RIBBON_VS`, `MOSS_FS`) and shared GLSL chunks such as `TERRAIN`. Either suffix style is fine; keep one style within a file and keep the names `SCREAMING_SNAKE_CASE` at module level.

### The `/* glsl */` tag

Add the `/* glsl */` comment before the template literal in new code - editors and plugins use this for GLSL syntax highlighting. Most existing shaders omit it; add it when you are already editing a shader, but don't churn files just for this.

### GLSL formatting

- 2-space indent inside GLSL
- Align `uniform` declarations:
  ```glsl
  uniform float uSize;
  uniform vec2  uMouse;
  uniform float uSpotlightRadius;
  ```
- One blank line between declarations and `void main()`

---

## 5. CSS / Tailwind

### Spacing between siblings → `gap`, not `mb-*`/`mt-*`

**Bad:**
```tsx
<div>
  <h1 className="mb-2">Title</h1>
  <p className="mt-1">Subtitle</p>
</div>
```

**Good:**
```tsx
<div className="flex flex-col gap-2">
  <h1>Title</h1>
  <p>Subtitle</p>
</div>
```

> `gap` lives on the parent, not the children. It's the flex/grid equivalent of `space-between`.

### Keep class names inline

Prefer inline `className` strings in JSX. Do not extract Tailwind class lists into separate constants unless there is a strong reason beyond readability.

Keep Tailwind utility classes on the element they style. Do not move a single element's class list into a top-level constant just to shorten JSX.

Gradients are an allowed exception. Long gradient strings may live in module-level constants when that improves readability.

### Responsive prefixes

Write desktop classes first, then `max-lg:` for tablet overrides, then `max-md:` for mobile overrides. This is the convention across the registry and the docs site (thousands of `max-md:` / `max-lg:` uses against a handful of `max-sm:`).

| Prefix | Screen |
|--------|--------|
| none | desktop |
| `max-lg:` | tablet, below 1025px (`--breakpoint-lg` is set to 1025px in `apps/docs/src/app/globals.css`) |
| `max-md:` | mobile, below 768px |

`max-sm:` is for extra small-screen tweaks in demos only. Avoid min-width prefixes (`sm:`, `md:`, `lg:`) and arbitrary `max-[...px]:` variants. In docs-site JS, use `MEDIA` / `BREAKPOINTS` from `@/lib/breakpoints` instead of hard-coded widths; registry effects can't import it (each package installs on its own), so they inline their queries. See `apps/docs/STYLE_GUIDE.md` for the full rules.

### Avoid one-off constants

Do not create a top-level constant for a value used only once or twice unless it meaningfully improves clarity.

Good candidates for constants:
- Reused values
- Sentinel values
- Thresholds that affect behavior
- Long gradients or similarly verbose static strings

Bad candidates for constants:
- A single `start` string used in one GSAP config
- A one-off `clamp(...)` font size used in one element
- A single Tailwind class fragment used by one element

### When to use `mb-*`/`mt-*`

Only when the element is **not** inside a flex/grid parent, or when you need asymmetric spacing that `gap` can't express.

### Convert arbitrary `px` values to `vw`

If a text size or any other style value is written with an arbitrary `px` value, convert that arbitrary value to `vw` instead.

Arbitrary `px` values still appear in a number of registry effects (mostly `w-[...px]`, `top-[...px]` and `max-w-[...px]`). Apply this rule to new code and to lines you are already changing; converting existing values changes the layout, so treat it as a UI change under `CHANGE_GUIDELINES.md`.

Do not change Tailwind's default utility sizes like `text-sm`, `text-2xl`, `px-6`, or `rounded-xl`. This rule applies only to arbitrary `px` values such as `text-[32px]`, `px-[24px]`, or `rounded-[18px]`.

**Bad:**
```tsx
className="text-[32px] px-6 rounded-[18px] gap-3"
```

**Good:**
```tsx
className="text-[2.2vw] px-[1.7vw] rounded-[1.3vw] gap-[0.8vw]"
```

### Limit arbitrary values to 1 decimal place

When using decimal values in Tailwind arbitrary classes, do not go beyond **1 decimal place**.

**Bad:**
```tsx
className="px-[1.67vw] rounded-[1.33vw] gap-[0.78vw]"
```

**Good:**
```tsx
className="px-[1.7vw] rounded-[1.3vw] gap-[0.8vw]"
```

### Remove redundant wrappers

**Bad:**
```tsx
<div className="text-center">
  <div className="text-center"> {/* redundant */}
    ...
  </div>
</div>
```

**Good:**
```tsx
<div className="flex flex-col items-center">
  ...
</div>
```

### Semantic elements in JSX

Use `<span>` for inline text nodes inside flex containers, not `<div>`:

```tsx
// Bad - div inside flex, no block content
<div className="text-sm text-white/50">{label}</div>

// Good
<span className="text-sm text-white/50">{label}</span>
```

### Avoid HTML entities in JSX

**Bad:**
```tsx
{x}&nbsp;·&nbsp;{y}
```

**Good:**
```tsx
{x} · {y}
```

JSX handles Unicode directly. Use real characters.

### Next.js navigation and images

In Next.js app code (`apps/docs/src`), use `Link` from `next/link` instead of raw `<a>` tags, and use `Image` from `next/image` instead of raw `<img>` tags.

Registry effects under `registry/effects` are installed into consumers' projects, and most of them use plain `<img>` / `<a>`; only a couple import from `next/*`. Don't convert a registry effect to `next/image` / `next/link` without checking with the owner, since that would change what consumers install.

**Bad:**
```tsx
<a href="/components">Components</a>
<img src="/hero.png" alt="Hero" />
```

**Good:**
```tsx
import Image from 'next/image'
import Link from 'next/link'

<Link href="/components">Components</Link>
<Image src="/hero.png" alt="Hero" width={1200} height={800} />
```

> Pass standard anchor props like `className`, `target`, and `rel` directly to `Link`. For `Image`, always provide meaningful `alt` text and the required sizing props unless using `fill` or a static import.

---

## 6. React Patterns

### useEffect - keep the WebGL lifecycle together

For Three.js or canvas effects, **keep the whole setup and teardown in one `useEffect`** (usually with an empty dep array). Do not split renderer, scene, material, animation loop and cleanup across several effects.

The sequential nature of WebGL setup (renderer → scene → geometry → material → add to scene → animate → cleanup) is a single lifecycle. Splitting it creates confusion about initialization order.

Small extra effects around it are normal and expected. Most WebGL effects in the registry have between two and several `useEffect`s: the setup effect plus sync effects that copy changing props into a ref the render loop reads, so a prop change doesn't tear down and rebuild the renderer:

```tsx
const configRef = useRef({ hue, intensity, reducedMotion });

// Prop sync: cheap, runs on every prop change
useEffect(() => {
  configRef.current = { hue, intensity, reducedMotion };
}, [hue, intensity, reducedMotion]);

// Lifecycle: runs once, the loop reads configRef.current each frame
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return undefined;
  // renderer, scene, loop ...
  return () => {
    // cleanup
  };
}, []);
```

Effects built on `@react-three/fiber` split the scene into child components, each with its own hooks; the same rule applies inside each one.

### Cleanup - always remove what you added

Every `addEventListener` needs a corresponding `removeEventListener` in the cleanup function. Every Three.js object needs `.dispose()`.

```ts
return () => {
  cancelAnimationFrame(animId);
  window.removeEventListener("resize", onResize);
  mount.removeEventListener("mousemove",  onMove);
  mount.removeEventListener("mouseenter", onEnter);
  mount.removeEventListener("mouseleave", onLeave);
  mount.removeEventListener("touchmove",  onTouch);
  mount.removeEventListener("touchend",   onTouchEnd); // ← named, so it can be removed

  if (mount.contains(renderer.domElement)) {
    mount.removeChild(renderer.domElement);
  }

  renderer.dispose();
  geometry.dispose();
  material.dispose();
};
```

### State vs refs for animation

| Data | Use |
|------|-----|
| Values that drive React re-renders (active state, cursor position display) | `useState` |
| Values only read inside `requestAnimationFrame` loop (alpha, smooth positions) | Plain `let` variables inside `useEffect` |
| Props the loop needs to see without re-running setup | A ref updated by a sync effect (see above) |

Never put animation-tick values in `useState` - it causes unnecessary re-renders every frame.

### Dependency arrays

Always list every prop/state used inside a `useEffect` in the dep array. If the effect depends on a color prop, that prop goes in the array.

The exception is the WebGL setup effect above: it reads props through a ref instead of directly, so its dep array stays `[]` (or lists only the values that genuinely require a rebuild, such as a geometry count). Don't read props directly inside it and then leave them out of the deps.

---

## 7. Comments

### Keep comments that explain *why*

```ts
// instant snap - avoids lerp drift from previous position
smoothMouse.copy(mouse);

// Alpha is encoded per-vertex in RGB (additive blending, no real alpha channel)
mouseLineColors[si + 3] = webColor.r * alpha;
```

### Remove comments that restate the code

```ts
// Bad - this is obvious from the code
// Set mouse present to true
mousePresent = true;

// Bad - leftover dev note
let mouseJustEntered = false; // <-- NEW: snap flag
```

### Section headers in long functions

Use short word-only section comments for sections longer than ~10 lines:

```ts
// Grid layout
```

---

## 8. Before You Commit - Checklist

- [ ] No unused variables, imports, or `console.log`
- [ ] All magic numbers are named constants
- [ ] All event listeners have named handler functions
- [ ] All named handlers are removed in cleanup
- [ ] GLSL strings are at module level, not inline
- [ ] No duplicate logic that could be a helper function
- [ ] CSS: `gap` used for sibling spacing, not `mb-*`/`mt-*` chains
- [ ] No redundant wrapper divs
- [ ] Comments explain *why*, not *what*
- [ ] No HTML entities (`&nbsp;`) where Unicode works fine

