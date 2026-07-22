# scroll-distortion (scroll)

## Summary
The `scroll-distortion` is a pro-tier, immersive scroll-synced WebGL transition component that morphs fullscreen images with a displacement noise pattern and triggers typographic split-character reveals. Visually premium and exceptionally well-engineered regarding performance, the component includes a proper off-screen rendering gate. However, it is blocked by a critical packaging bug and minor CORS concerns.

## Implementation overview
The component utilizes Three.js (`THREE`) to construct a WebGL scene containing an OrthographicCamera and a PlaneGeometry. It runs a custom ShaderMaterial using custom vertex and fragment shaders that execute displacement mapping and RGB shifting. GSAP is used to tween the shader's `u_progress` uniform on wheel or touch drag. Critically, it co-locates and integrates `createSuspendedRaf.js`, a visibility gate that suspends Three.js render loops when the component is off-screen.

## Strengths
- **Superior Off-screen Optimization:** Correctly integrates `createSuspendedRaf` which halts the WebGL render loop completely when the element is off-screen, preventing continuous GPU/CPU resource utilization when idle.
- **Flawless WebGL Cleanup:** The unmount callback cleanly disposes of the WebGLRenderer, disposes of materials, geometries, and individual image textures, and empties the container DOM, avoiding severe WebGL context leaks.
- **Robust Text Transitioning:** Typography fly-in animations are correctly managed, ensuring old character twins are fully killed and garbage collected before the next set is animated.

## Risks and issues
- **Critical Severity:** Broken NPM distribution. Inside `package.json`, both the `"main"` and `"files"` keys point to a nonexistent file named `"scroll-distortion.jsx"`, making the distributed package completely empty.
  - File: `registry/effects/scroll/scroll-distortion/package.json#L5`
  - File: `registry/effects/scroll/scroll-distortion/package.json#L7`
- **Medium Severity:** Absence of motion preferences. Fast WebGL displacement and typographic character shifting can induce motion sickness; the component should disable the transition shaders/tweens when `prefers-reduced-motion` is active.
- **Low Severity:** CORS Dependency Risk. Image files are fetched via `fetch(..., { mode: "cors" })` to construct blob object URLs for Three.js textures. If a user sets up custom image assets on a CDN that does not have lenient Access-Control-Allow-Origin headers, the component will crash. This should be explicitly documented.
  - File: `registry/effects/scroll/scroll-distortion/index.jsx#L125`

## Accessibility assessment
- **Keyboard Navigation:** Unsupported. Keyboard users cannot scrub the WebGL slide transitions, as there are no keyboard handlers or standard interactive controls.
- **ARIA Semantics:** Good. The header text maps use `aria-label` containing the full word on the parent heading and hide split character elements via `aria-hidden="true"`, ensuring screen readers announce words clearly.
  - File: `registry/effects/scroll/scroll-distortion/index.jsx#L710-L716`

## Performance assessment
- **rAF Loop / Continuous Animation:** Excellent. WebGL renders only on active animation frames and is throttled/paused via the visibility intersection observer.
- **Off-screen Suspension:** Pass. Fully handled by the `createSuspendedRaf` module.
- **Cleanup:** Pass. Full Three.js garbage collection and context release on unmount.

## SEO and content-surface assessment
- **Crawler Visibility:** Great. While the core visual images are in WebGL, the text headers are fully present as standard HTML nodes, allowing search engine crawlers to parse the content.
- **Semantic Tags:** Good. Uses standard `<section>` and `<h1/>` semantic layout headers.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1025px):** State-of-the-art WebGL interactive experience.
- **Mobile/Tablet (< 1025px):** Seamless touch dragging support using touch event listeners (`touchstart`/`touchmove`) that track drag delta to scrub transitions on mobile viewports.

## Maintainability and code-quality assessment
- Clean and exceptionally well-written. Composes Three.js shaders directly into template strings inside the React module.
- Unmount hooks are comprehensive, leaving no loose event listeners or unresolved object URLs (calls `URL.revokeObjectURL(url)`).

## Security and dependency concerns
- No security concerns. High dependency on `three` and `gsap`.

## Browser compatibility considerations
- Requires WebGL support, which is widely available in all modern browsers. It limits pixel ratio to `2` to optimize rendering on high-DPI retina screens.

## What was checked and found clean
- `registry.json` schema is correct and specifies dependency arrays correctly.
- Three.js WebGL context loss is handled.
- Image object URLs are revoked to prevent memory leaks.

## Suggested improvements and remediation priorities
1. **Fix package.json Metadata (Critical Priority):** Update `"main"` to point to `"index.jsx"` and correct `"files"` to include `"index.jsx"` and `"createSuspendedRaf.js"`.
2. **Incorporate Reduced Motion Fallback (High Priority):** Bypasses WebGL displacement morphs and split characters, instantly swapping slides if reduced motion is requested.
3. **CORS Documentation (Low Priority):** Add a troubleshooting section in docs highlighting CORS setup requirements for custom image URLs.

## Final score: 7.5/10

## Overall severity label: High
