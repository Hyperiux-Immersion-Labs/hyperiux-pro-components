# horizontal-feature-reveal (scroll)

## Summary
The `horizontal-feature-reveal` is a horizontal storytelling section that translates vertical scroll into a panoramic horizontal gallery track, complete with staggered character splits, text sliding animations, and image scrolling effects. However, the component suffers from critical packaging and licensing flaws: it refers to non-existent source files in its registry schema, lists broken package entry points, and illegal imports the proprietary paid **GSAP Club members-only `SplitText`** plugin while being offered under the "free" tier.

## Implementation overview
The component converts normal vertical scroll into horizontal movement by translating the `.industry-container` track on the X-axis based on scroll depth. Inside `HorizontalFeatureRevealComp.jsx`, a `useEffect` hook configures custom ScrollTriggers for each individual card to trigger character-level staggered animations for text, headings, and numbers as they scroll into view.

## Strengths
- **Teardown Quality:** Safely wraps all GSAP timelines and SplitText operations inside a `gsap.context()` block, returning `() => ctx.revert()` on unmount to restore the DOM and prevent memory leaks.
- **Dynamic Mobile Columns Fallback:** Gracefully shifts to a standard grid layout on narrow viewports (`window.innerWidth < 1024`) via responsive CSS classes, protecting mobile GPUs from intensive 3D layout math.
- **Detailed Custom Coordinates:** Supports highly custom trigger configurations (`triggers: { img: { start, end }... }`) passed directly via page properties, enabling granular visual control.

## Risks and issues
- **Critical Severity (Missing Registry Files):** The `registry.json` configuration declares an entry for a file named `"HorizontalFeatureReveal.jsx"`, but this file does not exist in the registry directory. Users who try to install this component using the CLI will receive missing file errors, completely breaking installation.
  - File: `registry/effects/scroll/horizontal-feature-reveal/registry.json#L26`
- **Critical Severity (Paid GSAP Club Dependency on Free Tier):** The component imports and registers the `SplitText` plugin from `"gsap/SplitText"`. `SplitText` is a closed-source, proprietary paid **GSAP Club GreenSock members-only plugin**. Shipping a paid, club-only dependency inside a component designated as `"tier": "free"` creates severe licensing compliance issues and breaks builds for all users who do not have paid GSAP licenses.
  - File: `registry/effects/scroll/horizontal-feature-reveal/HorizontalFeatureRevealComp.jsx#L4`
  - File: `registry/effects/scroll/horizontal-feature-reveal/HorizontalFeatureRevealComp.jsx#L7`
- **High Severity:** The `package.json` file points its `main` entry point and files array to `"horizontal-feature-reveal.jsx"`, which does not exist in the folder (the directory contains `index.jsx` and `HorizontalFeatureRevealComp.jsx`). This prevents module compiling.
  - File: `registry/effects/scroll/horizontal-feature-reveal/package.json#L5`
  - File: `registry/effects/scroll/horizontal-feature-reveal/package.json#L7`
- **Medium Severity:** Bypasses `prefers-reduced-motion` settings. Splitting text, character sliding, and rapid horizontal canvas panning can trigger motion sensitivities; a media query should bypass these animations if reduced motion is requested.
  - File: `registry/effects/scroll/horizontal-feature-reveal/HorizontalFeatureRevealComp.jsx#L15`
- **Low Severity:** NPM package dependencies are listed in `dependencies` instead of `peerDependencies`, leading to duplicate dependency bloating.
  - File: `registry/effects/scroll/horizontal-feature-reveal/package.json#L14`

## Accessibility assessment
- **Keyboard Navigation:** Completely unsupported. The scroll gallery cannot be traversed using Tab, and there are no keyboard scroll triggers.
- **ARIA Semantics:** Missing all region landmark indicators or screen-reader announcements to explain the horizontal track movement.
- **SplitText A11y Hazards:** Splitting words into individual characters/chars destroys semantic accessibility. Screen readers will read individual split letters (`B`, `u`, `r`, `j`...) aloud instead of the complete word "Burj", completely breaking readability.
  - File: `registry/effects/scroll/horizontal-feature-reveal/HorizontalFeatureRevealComp.jsx#L71-L76`

## Performance assessment
- **rAF Loop / Continuous Animation:** Pass. The component does not run a continuous loop when scroll is stationary. Transforms are computed strictly on ScrollTrigger updates.
- **Off-screen Suspension:** Pass. GSAP ScrollTrigger automatically suspends tick computations when the section leaves the viewport.
- **Memory Leak Protection:** Pass. Reverts and cleans up all SplitText and ScrollTrigger registrations on unmount.

## SEO and content-surface assessment
- **Crawler Visibility:** Moderate. Text content is declared in the JSX, which is good. However, because SplitText alters the DOM node structure by wrapping characters in nested `div` spans, raw HTML search bots may index text as split elements rather than continuous sentences.

## Responsive / mobile / touch behavior assessment
- **Desktop (>= 1025px):** Panoramic horizontal gallery track with beautiful split staggered entry reveals.
- **Mobile/Tablet (< 1025px):** Intentionally bypasses GSAP timelines and wraps slides into a traditional vertical stack (`max-[1025px]:static`, `max-[1025px]:h-fit`). This is a functional safety fallback, but it means mobile users lose all transition effects.

## Maintainability and code-quality assessment
- Code structure is clean, with visual content configured in a modular `PROPERTIES_DATA` list.
- Good utilization of modular component files.

## Security and dependency concerns
- High dependency concern regarding GSAP SplitText licensing compliance.

## Browser compatibility considerations
- Highly compatible across modern desktop and mobile browsers, though requires flexible box model support.

## What was checked and found clean
- Correct GSAP unmount cleanups (`ctx.revert()`).
- Solid, responsive layout design fallback for mobile viewports.

## Suggested improvements and remediation priorities
1. **Remove Paid SplitText Dependency (Critical Priority):** To keep the component on the `"free"` tier, replace `gsap/SplitText` with a custom free text splitter function or CSS transitions. Alternatively, move the component to the `"club"` or `"pro"` tier and ensure clear licensing disclaimers are visible.
2. **Fix Missing Registry Declarations (Critical Priority):** Delete the non-existent `"HorizontalFeatureReveal.jsx"` entry from `registry.json` or create the file to prevent CLI installation errors.
3. **Fix package.json Entry Points (Critical Priority):** Correct `main` to point to `"index.jsx"` and update `files` to include the correct component files.

## Final score: 3/10

## Overall severity label: Critical
