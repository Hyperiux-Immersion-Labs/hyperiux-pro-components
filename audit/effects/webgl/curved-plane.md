# Audit Report: Curved Plane

## Summary
The **Curved Plane** component is an interactive image swiper/carousel utilizing custom WebGL GLSL shaders. On drag and scroll, the edges of the image planes bend and deform relative to interaction velocity. It features clean, separate Horizontal and Vertical implementations, highly robust event listeners and WebGL disposes, but suffers from the standard public registry file omission bug.

---

## Implementation
- **Rendering Stack**: Three.js (WebGL) over standard canvas.
- **Animation Loop**: Custom loop utilizing `createSuspendedRaf` inside both Horizontal and Vertical implementations.
- **Interaction**: Drag, swipe, touch, scroll wheel with physics momentum.

---

## Strengths
- **Exemplary Resource Cleanup**: High-standard cleanups. On unmount, the component loops through every image mesh, explicitly disposes of its geometry and shader material, disposes the WebGL renderer (`renderer.dispose()`), removes all window/container touch/mouse/wheel listeners, and removes the canvas.
- **Independent Implementations**: Horizontal and Vertical variants are cleanly separated, keeping code modules focused and maintainable.

---

## Risks/Issues

### 1. Critical Public JSON Dependency Omission (CLI Failure)
- **File**: `apps/docs/public/r/curved-plane.json#L15-L31`
- **Description**: The public registry JSON `files` array lists `index.jsx`, `CurvedSwiperHorizontal.jsx`, and `CurvedSwiperVertical.jsx` but completely omits the required helper file `createSuspendedRaf.js`. Running the installer CLI command will download a broken package.

---

## Accessibility
- **Keyboard Access**: None. The carousel cannot be swiped using standard Arrow Keys or Focus tabs.
- **Screen Reader Support**: None. Images are flattened inside a WebGL context with no fallback DOM labels or alternate text.

---

## Performance
- **Draw Call Overhead**: Very low, as only the visible and neighboring panels are rendered.
- **Layout Thrashing**: Low. Uses clean relative sizing of the canvas.

---

## Checked/Clean
The following files were checked during this audit:
- `registry/effects/webgl/curved-plane/registry.json`
- `registry/effects/webgl/curved-plane/index.jsx`
- `registry/effects/webgl/curved-plane/CurvedSwiperHorizontal.jsx`
- `registry/effects/webgl/curved-plane/CurvedSwiperVertical.jsx`
- `apps/docs/public/r/curved-plane.json`

---

## Remediation

### Step 1: Sync Public JSON Manifest
Add the `createSuspendedRaf.js` file entry to the public `curved-plane.json` files array:
```json
{
  "path": "createSuspendedRaf.js",
  "type": "registry:component",
  "target": "components/hyperiux/createSuspendedRaf.js"
}
```

### Step 2: Implement Keyboard Fallback controls
Attach keydown listeners to the window so keyboard users can navigate slide items:
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      // scroll forward
    } else if (e.key === "ArrowLeft") {
      // scroll backward
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

---

## Score & Severity
- **Audit Score**: 8.5 / 10
- **Severity**: High (causes CLI compilation errors due to missing files)
