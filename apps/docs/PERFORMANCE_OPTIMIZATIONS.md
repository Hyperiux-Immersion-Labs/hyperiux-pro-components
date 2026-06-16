# Landing Page Performance Optimizations

> **Status:** Pending implementation  
> **Files affected:** `ReflectiveRods.jsx`, `GlowingPlates.jsx`, `FeaturedStoryTelling.jsx`

---

## Root Causes (Why It Stutters)

### 🔴 #1 — Two concurrent WebGL canvases

`GlowingPlates` (hero section) and `ReflectiveRods` (footer) both render 60fps WebGL simultaneously. `GlowingPlates` already pauses when off-screen, but `ReflectiveRods` has **no IntersectionObserver** — it renders full-speed even when the footer is 2000px below the fold. Two live WebGL canvases = GPU contention = stutter.

### 🔴 #2 — `ReflectiveRods` always listens to `mousemove`

The `window` mousemove listener in `ReflectiveRods` fires on every mouse movement regardless of whether the footer is visible. This drives `useFrame` tilt calculations even when the rods aren't on screen.

### 🔴 #3 — `GlowingPlates` marks GPU matrices dirty every frame unconditionally

Lines 362–363 call `instanceMatrix.needsUpdate = true` on both instanced meshes **every frame**, even when no hover is active and nothing has moved. That's 102 unnecessary GPU buffer uploads per frame.

### 🟡 #4 — `getBoundingClientRect()` called live inside scroll scrub

In `FeaturedStoryTelling.jsx`, two separate GSAP function callbacks (`x: () => ...` and `y: () => ...`) each call `getBoundingClientRect()` during scroll scrub, forcing browser layout recalculation on every tick.

### 🟡 #5 — `getBoundingClientRect()` called on every `mousemove` in `GlowingPlates`

`handlePointer` calls `el.getBoundingClientRect()` inside the event handler on every mouse pixel move. Should be cached and updated only on resize.

---

## Fixes To Implement

### Fix 1 — `ReflectiveRods.jsx`: Add IntersectionObserver + frameloop throttle

**Pattern:** Same as `GlowingPlates`.

```jsx
// Add to ReflectiveRods()
const containerRef = useRef(null);
const [inView, setInView] = useState(false);

useEffect(() => {
  const el = containerRef.current;
  if (!el) return;
  const observer = new IntersectionObserver(
    ([entry]) => setInView(entry.isIntersecting),
    { threshold: 0.0 }
  );
  observer.observe(el);
  return () => observer.disconnect();
}, []);
```

Then add `ref={containerRef}` to the `<section>` and `frameloop={inView ? "always" : "never"}` to `<Canvas>`.

---

### Fix 2 — `ReflectiveRods.jsx`: Gate `mousemove` listener to in-view only

```jsx
useEffect(() => {
  if (!inView) return; // ← add this guard

  const handleMouseMove = (e) => { ... };
  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, [inView]); // ← change dependency from [] to [inView]
```

---

### Fix 3 — `GlowingPlates.jsx`: Only mark matrices dirty when values changed

Add a `matrixDirty` flag to the frame loop. Only set `instanceMatrix.needsUpdate = true` when something actually moved.

```js
// At top of frame loop, before the per-plate loop:
let matrixDirty = hovId !== -1; // always dirty when hovering

// Inside the per-plate loop, check if lerp values have meaningfully changed:
const scaleDelta = Math.abs(scaleArr[i] - prevScale);
if (scaleDelta > 0.0001) matrixDirty = true;

// At the bottom, gate the GPU upload:
if (matrixDirty) {
  main.instanceMatrix.needsUpdate = true;
  glow.instanceMatrix.needsUpdate = true;
}
```

---

### Fix 4 — `GlowingPlates.jsx`: Cache `getBoundingClientRect` on resize

```jsx
// Outside handlePointer:
const rectRef = useRef(null);

useEffect(() => {
  const el = gl.domElement;
  rectRef.current = el.getBoundingClientRect();

  const ro = new ResizeObserver(() => {
    rectRef.current = el.getBoundingClientRect();
  });
  ro.observe(el);
  return () => ro.disconnect();
}, [gl]);

// Inside handlePointer:
const handlePointer = (clientX, clientY) => {
  const r = rectRef.current;
  if (!r) return;
  pointer.x = ((clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((clientY - r.top) / r.height) * 2 + 1;
};
```

---

### Fix 5 — `FeaturedStoryTelling.jsx`: Cache `getBoundingClientRect` for vault move animation

Currently two GSAP function callbacks each call `getBoundingClientRect()` live during scrub:

```js
// ❌ Current — forces layout flush on every scrub tick
masterTL.to(vaultMoveTextRef.current, {
  x: () => {
    const stickyRect = stickyContainerRef.current.getBoundingClientRect();
    const targetRect = vaultTargetMoveRef.current.getBoundingClientRect();
    return targetRect.left - stickyRect.left;
  },
  ...
});
masterTL.to(vaultMoveTextRef.current, {
  y: () => {
    const stickyRect = stickyContainerRef.current.getBoundingClientRect();
    const targetRect = vaultTargetMoveRef.current.getBoundingClientRect();
    return targetRect.top - stickyRect.top;
  },
  ...
});
```

```js
// ✅ Fixed — compute once, reuse cached values
let cachedMoveX = 0;
let cachedMoveY = 0;

const cacheMoveTarget = () => {
  if (!stickyContainerRef.current || !vaultTargetMoveRef.current) return;
  const stickyRect = stickyContainerRef.current.getBoundingClientRect();
  const targetRect = vaultTargetMoveRef.current.getBoundingClientRect();
  cachedMoveX = targetRect.left - stickyRect.left;
  cachedMoveY = targetRect.top - stickyRect.top;
};
cacheMoveTarget();
ScrollTrigger.addEventListener("refreshInit", cacheMoveTarget);

// Then use static values in the timeline:
masterTL.to(vaultMoveTextRef.current, { x: () => cachedMoveX, duration: 0.6 }, 13.8);
masterTL.to(vaultMoveTextRef.current, { y: () => cachedMoveY, duration: 0.6 }, 13.8);
```

---

### Fix 6 — `ReflectiveRods.jsx`: Reduce geometry smoothness

```jsx
// ❌ Current
<RoundedBoxGeometry args={[1, 1, 1]} radius={0.18} smoothness={10} />

// ✅ Fixed — 40% fewer vertices, visually identical at this camera distance
<RoundedBoxGeometry args={[1, 1, 1]} radius={0.18} smoothness={6} />
```

---

### Fix 7 — `ReflectiveRods.jsx`: Cap DPR on high-density screens

```jsx
// ❌ Current
<Canvas dpr={[1]} ...>

// ✅ Fixed — avoids 2x rendering on Retina screens
<Canvas dpr={[0.8, 1]} ...>
```

---

## Impact Summary

| # | Fix | File | Impact |
|---|-----|------|--------|
| 1 | IntersectionObserver + `frameloop` throttle | `ReflectiveRods.jsx` | 🔴 High |
| 2 | Gate `mousemove` listener to in-view only | `ReflectiveRods.jsx` | 🔴 High |
| 3 | Dirty flag for GPU matrix uploads | `GlowingPlates.jsx` | 🔴 High |
| 4 | Cache `getBoundingClientRect` on resize | `GlowingPlates.jsx` | 🟡 Medium |
| 5 | Cache vault move rects, remove live BCR calls | `FeaturedStoryTelling.jsx` | 🟡 Medium |
| 6 | Reduce RoundedBox smoothness 10→6 | `ReflectiveRods.jsx` | 🟢 Low |
| 7 | Cap canvas DPR to `[0.8, 1]` | `ReflectiveRods.jsx` | 🟢 Low |

---

## Verification After Implementation

1. `npm run build` — must pass clean.
2. DevTools **Performance** tab → record 3s of scroll → confirm no long frames (>16ms) from `getBoundingClientRect` or GPU uploads.
3. Confirm `ReflectiveRods` WebGL pauses while hero is on screen (check in DevTools GPU activity).
4. Visual check: rods still look correct, hover glow on plates still works, spiral cards animation unchanged.
