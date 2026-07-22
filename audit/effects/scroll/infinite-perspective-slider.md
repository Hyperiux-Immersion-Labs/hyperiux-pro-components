# infinite-perspective-slider (scroll)

## Summary
The `infinite-perspective-slider` is a looping 3D perspective gallery with wheel and touch drag momentum physics, combined with staggered split-text hover reveals. It is one of the most visually impressive effects in the registry and includes a highly performant, custom-suspended render loop. However, it suffers from a critical licensing violation by importing the proprietary paid **GSAP Club members-only `SplitText`** plugin on the free tier, contains broken NPM packaging entries, and has a major contrast bug where the scroll helper icon is rendered completely invisible.

## Implementation overview
The component runs a custom requestAnimationFrame loop managed by a visibility gate utility (`createSuspendedRaf`). It handles physics computations on every frame, including velocity damping and rotation momentum based on drag or scroll speed. When a slide is hovered over, GSAP SplitText is used to animate lines on scroll-stop. The visual components are structured into `index.jsx` (which lists default high-res image data) and `InfinitePerspectiveSliderComp.jsx` (which runs the canvas rendering and physics engine).

## Strengths
- **Superb Off-screen Suspension:** Fully complies with performance rules. Uses `createSuspendedRaf` to pause the physics render loop whenever the component's parent container is off-screen or the active tab is hidden, minimizing CPU/GPU cycles.
  - File: `registry/effects/scroll/infinite-perspective-slider/createSuspendedRaf.js`
- **Outstanding Physics and Feel:** Implements extremely polished velocity-based deceleration inertia (LERP math), offering an exceptional desktop dragging experience.
- **Robust Cleanup:** Properly cancels requestAnimationFrame loops, kills custom timelines, reverts SplitText changes, and unbinds event handlers on unmount.

## Risks and issues
- **Critical Severity (Paid GSAP Club Dependency on Free Tier):** The component imports and registers the `SplitText` plugin from `"gsap/SplitText"`. `SplitText` is a closed-source, proprietary paid **GSAP Club GreenSock members-only plugin**. Shipping a paid, club-only dependency inside a component designated as `"tier": "free"` creates severe licensing compliance issues and breaks builds for all users who do not have paid GSAP licenses.
  - File: `registry/effects/scroll/infinite-perspective-slider/InfinitePerspectiveSliderComp.jsx#L6`
  - File: `registry/effects/scroll/infinite-perspective-slider/InfinitePerspectiveSliderComp.jsx#L9`
- **High Severity:** Broken packaging configuration. The `package.json` specifies its `main` entry point and package files as `"infinite-perspective-slider.jsx"`, but no such file exists in the directory (the source files are `index.jsx` and `InfinitePerspectiveSliderComp.jsx`). This prevents standard installation builds.
  - File: `registry/effects/scroll/infinite-perspective-slider/package.json#L5`
  - File: `registry/effects/scroll/infinite-perspective-slider/package.json#L7`
- **Medium Severity (Invisible Scroll Helper SVG):** Major contrast bug. The scroll indicator SVG at the bottom of the slider defines its inline polyline strokes explicitly as `"white"`. However, the slider is mounted on a bright white background (`bg-white` inside `index.jsx` and `text-black` on the helper container), rendering the scroll helper icon completely white-on-white and invisible to users.
  - File: `registry/effects/scroll/infinite-perspective-slider/index.jsx#L69`
  - File: `registry/effects/scroll/infinite-perspective-slider/InfinitePerspectiveSliderComp.jsx#L600`
  - File: `registry/effects/scroll/infinite-perspective-slider/InfinitePerspectiveSliderComp.jsx#L626`
- **Medium Severity:** Bypasses `prefers-reduced-motion` settings. Auto-looping perspective tilts can cause motion-sickness; the component should disable 3D rotation tilts if reduced motion is requested.
  - File: `registry/effects/scroll/infinite-perspective-slider/InfinitePerspectiveSliderComp.jsx#L298`
- **Low Severity:** NPM package dependencies are listed in `dependencies` instead of `peerDependencies`, leading to duplicate dependency bloating.
  - File: `registry/effects/scroll/infinite-perspective-slider/package.json#L14`

## Accessibility assessment
- **Keyboard Navigation:** Completely unsupported. The slide track is not focusable (`tabindex`), and there are no keyboard shortcuts (like arrow keys) to slide left or right.
- **ARIA Semantics:** Missing all region landmark indicators or screen-reader announcements to explain the horizontal track movement.
- **SplitText A11y Hazards:** Splitting words into individual characters/chars destroys semantic accessibility. Screen readers will read individual split letters aloud instead of the complete word.
  - File: `registry/effects/scroll/infinite-perspective-slider/InfinitePerspectiveSliderComp.jsx#L353-L366`

## Performance assessment
- **rAF Loop / Continuous Animation:** Yes, the component relies on a continuous rAF loop to update horizontal slide coordinates.
- **Off-screen Suspension:** Pass. Correctly suspends calculations via the visibility gate (`createSuspendedRaf`), protecting resources.
- **Teardown:** Pass. All handlers and custom loops are cleaned up on unmount.

## SEO and content-surface assessment
- **Crawler Visibility:** Solid. The images and layout containers are rendered directly in the static DOM tree, allowing standard search engine bots to index them.
- **Semantic HTML:** Average. Lacks proper semantic structural elements like `<section/>` or `<aside/>`.

## Responsive / mobile / touch behavior assessment
- **Desktop:** Ultra-premium, responsive 3D cylinder layout.
- **Mobile (< 640px):** Adapts card widths and spacing (`MOBILE_CARD_WIDTH = 240`, `MOBILE_CARD_GAP = 16`), which is excellent. Touch swipe gestures are highly fluid and responsive.

## Maintainability and code-quality assessment
- Physics equations are elegant and nicely parameterized via props.
- The use of dynamic setters (`gsap.quickSetter`) is highly performant.

## Security and dependency concerns
- High dependency concern regarding GSAP SplitText licensing compliance.

## Browser compatibility considerations
- Highly compatible across modern desktop and mobile browsers, though requires flexible box model support.

## What was checked and found clean
- Correct GSAP unmount cleanups.
- Solid, responsive layout design fallback for mobile viewports.

## Suggested improvements and remediation priorities
1. **Remove Paid SplitText Dependency (Critical Priority):** To keep the component on the `"free"` tier, replace `gsap/SplitText` with a custom free text splitter function or CSS transitions. Alternatively, move the component to the `"club"` or `"pro"` tier and ensure clear licensing disclaimers are visible.
2. **Fix Invisible Scroll Icon (High Priority):** Remove the hardcoded `"white"` polyline stroke colors in the SVG, allowing the polyline to inherit the correct container `stroke-current` and `text-black` values so that it is visible on a white background.
3. **Fix package.json Entry Points (Critical Priority):** Correct `main` to point to `"index.jsx"` and update `files` to include the correct component files.

## Final score: 4/10

## Overall severity label: Critical
