# inertia-img (cursor)

## Summary

Physics-based inertia and wobble animation on hover grids using GSAP. Contains a Critical licensing and dependency issue by importing GSAP's proprietary, member-only `InertiaPlugin` which is unavailable to standard NPM users without paying paid GSAP Club subscriptions.

## Implementation overview

- **`index.jsx`** — Main wrapper loading target placeholder images.
- **`InertiaImgComp.jsx`** — Captures mouse momentum delta and triggers GSAP timeline animations with the InertiaPlugin.

## Strengths

- Highly interactive, premium feeling physics and rotation transitions on image clusters.
- Great fallback adjustments for mobile touch interaction speeds.

## Risks and issues

1. **[Critical] Premium GreenSock Club Dependency.** Imports `InertiaPlugin` from `gsap/InertiaPlugin`. This is a premium GreenSock Club member-only plugin. It is NOT included in the public open-source `gsap` package, and standard users installing this component will get compilation errors (`Module not found`) unless they are paying GSAP subscribers.

## Accessibility assessment

- Unconditionally triggers rapid scaling, rotating, and movement, which is highly problematic for motion-sensitive users.

## Performance assessment

- GSAP timelines are cleanly killed on complete (`onComplete: () => tl.kill()`) preventing memory build ups.

## SEO and content-surface assessment

- Standard crawlable image structures.

## Responsive / mobile / touch behavior assessment

- Includes comprehensive touch device detection to adjust inertia scaling thresholds.

## Maintainability and code-quality assessment

- Dependent on paid external packages, which complicates commercial usage and distribution of the library.

## Security and dependency concerns

- Fails to build on standard npm environments without GSAP developer tokens.

## Browser compatibility considerations

- Works in modern browsers with standard transform and GPU layering.

## What was checked and found clean

- All event listeners correctly unregistered on unmount.

## Suggested improvements and remediation priorities

1. Refactor the inertia logic to use a simple open-source spring library like standard framer-motion or custom velocity Verlet curves to remove dependency on paid GSAP member-only plugins.

## Final score: 4/10
## Overall severity label: Critical
