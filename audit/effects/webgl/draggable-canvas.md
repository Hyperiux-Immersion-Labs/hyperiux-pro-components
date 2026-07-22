# Audit Report: Draggable Canvas

## Summary
The **Draggable Canvas** component is an interactive multi-window layout with six floating HTML Canvas 2D containers draggable via GSAP and `InertiaPlugin`. It features an impressive custom "parallax masking illusion" where each floating canvas acts as a portal revealing a specific cropped region of a shared background video. The system utilizes extremely granular offscreen suspension but suffers from the standard public registry file omission bug.

---

## Implementation
- **Rendering Stack**: Multi-canvas Canvas 2D contexts, GSAP, and `InertiaPlugin`.
- **Animation Loop**: Custom loop utilizing `createSuspendedRaf` uniquely initialized for **each separate card container**.
- **Interaction**: Dragging, flicking, and deceleration inertia mapped via GSAP.

---

## Strengths
- **Granular Gated Suspension**: Exceptional implementation. Instead of binding the visibility gate to the top-level parent container, `MaskedContainer.jsx` binds `createSuspendedRaf` to each individual card (`root: maskRef.current`). This means that as individual cards are thrown or dragged off-screen, their rendering loops are paused independently, saving immense CPU cycle time.
- **GSAP Instance Cleanups**: Properly detaches and kills draggable GSAP handlers (`draggable.kill()`) when cards are unmounted, preventing zombie event triggers.

---

## Risks/Issues

### 1. Critical Public JSON Dependency Omission (CLI Failure)
- **File**: `apps/docs/public/r/draggable-canvas.json#L15-L31`
- **Description**: The public registry JSON files array lists `index.jsx`, `DragCursor.jsx`, and `MaskedContainer.jsx`, but completely omits the required utility file `createSuspendedRaf.js`. CLI installation will fail inside user code environments due to unresolved relative imports.

---

## Accessibility
- **Keyboard Access**: None. The floating canvases cannot be refocused or dragged using keyboard keys.
- **Screen Reader Support**: None. Video content has no `<track>` captions or alternative descriptive tags.

---

## Performance
- **Draw Call Overhead**: Extremely efficient. Rendering is offloaded to lightweight 2D canvas loops.
- **Layout Thrashing**: Well-managed, using absolute positioning.

---

## Checked/Clean
The following files were checked during this audit:
- `registry/effects/webgl/draggable-canvas/registry.json`
- `registry/effects/webgl/draggable-canvas/index.jsx`
- `registry/effects/webgl/draggable-canvas/DragCursor.jsx`
- `registry/effects/webgl/draggable-canvas/MaskedContainer.jsx`
- `apps/docs/public/r/draggable-canvas.json`

---

## Remediation

### Step 1: Sync Public JSON Manifest
Add the `createSuspendedRaf.js` entry to the public `draggable-canvas.json` files array:
```json
{
  "path": "createSuspendedRaf.js",
  "type": "registry:component",
  "target": "components/hyperiux/createSuspendedRaf.js"
}
```

---

## Score & Severity
- **Audit Score**: 9.2 / 10
- **Severity**: High (causes CLI compilation errors due to missing files)
