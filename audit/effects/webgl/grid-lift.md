# Audit Report: Grid Lift

## Summary
The **Grid Lift** is a 2D interactive canvas effect featuring a "lifted" grid mask driven by mouse pointers, custom SVG uploads, or real-time text renderings. Users can manipulate parameters live via integrated Leva sliders. While categorised under `webgl`, it is implemented entirely on a standard 2D canvas context, meaning it bypasses heavy GPU allocations. It implements optimal visibility gating but has the standard public registry file omission bug.

---

## Implementation
- **Rendering Stack**: Dual 2D Canvas contexts (one visible canvas, one offscreen mask canvas utilizing `willReadFrequently: true`).
- **Animation Loop**: Custom loop utilizing `createSuspendedRaf` anchored to the canvas element.
- **Controls**: Live adjustable parameters using Leva Panel interfaces.

---

## Strengths
- **Intelligent Dual-Canvas Math**: Employs efficient pixel mapping. An offscreen 2D canvas renders text or uploaded SVGs, and the loop checks pixel alphas to determine which cells should "lift" and rotate based on mouse pointer distance.
- **Dynamic Control Theme**: Implements a customized dark theme for Leva controls that integrates with the website style.

---

## Risks/Issues

### 1. Critical Public JSON Dependency Omission (CLI Failure)
- **File**: `apps/docs/public/r/grid-lift.json#L15-L21`
- **Description**: The public registry JSON files array lists only `index.jsx` but completely omits the required utility file `createSuspendedRaf.js`. Running the CLI `add` command results in an uncompilable import error in user environments.

---

## Accessibility
- **Screen Reader Support**: None. Live textual inputs rendered inside the canvas mask are fully unreadable by screen readers.
- **Keyboard Access**: None. The grid cell interaction cannot be triggered with keyboard events.

---

## Performance
- **CPU/GPU Efficiency**: High. Running on Canvas 2D rather than WebGL ensures lower GPU overhead, though reading pixel states (`getImageData`) can cause minor frame stutters if the grid cells are sized too small (under 6px spacing).

---

## Checked/Clean
The following files were checked during this audit:
- `registry/effects/webgl/grid-lift/registry.json`
- `registry/effects/webgl/grid-lift/index.jsx`
- `apps/docs/public/r/grid-lift.json`
- `apps/docs/src/app/(marketing)/demo/grid-lift/page.js`

---

## Remediation

### Step 1: Sync Public JSON Manifest
Add the `createSuspendedRaf.js` entry to the public `grid-lift.json` files array:
```json
{
  "path": "createSuspendedRaf.js",
  "type": "registry:component",
  "target": "components/hyperiux/createSuspendedRaf.js"
}
```

---

## Score & Severity
- **Audit Score**: 9.0 / 10
- **Severity**: High (causes CLI compilation errors due to missing files)
