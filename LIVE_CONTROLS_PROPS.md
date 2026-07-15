# Live-Tweakable Props (Leva-style Controls)

A per-effect catalogue of props/values that can be exposed as **live controls** (sliders, colors, toggles, dropdowns) so users can tweak the animation in real time.

**Legend**
- `slider` → numeric range control
- `color` → color picker
- `toggle` → boolean switch
- `select` → dropdown of preset options
- `text` → string input
- ⚙️ = currently a hardcoded internal constant (needs to be lifted to a prop to make it live)
- ✅ = already an accepted prop on the component

> Images/media sources and data arrays (titles, copy) are intentionally excluded — colors, sizes, timings, easings, counts etc. are all fair game.

---

## 1. infinite-perspective-slider
`components/infinite-perspective-slider/InfinitePerspectiveSliderComp.jsx`
- ⚙️ **scrollPerPx** `slider` — scroll sensitivity; how far the strip moves per pixel scrolled.
- ⚙️ **lerp** `slider (0–1)` — smoothing of the strip motion; lower = more lag/inertia.
- ⚙️ **velocityLerp** `slider (0–1)` — smoothing of velocity-driven skew.
- ⚙️ **cardWidth / cardGap** `slider` — card size and spacing (desktop/tablet/mobile variants).
- ⚙️ **rotationSensitivity** `slider` — how strongly cards rotate with scroll velocity.
- ⚙️ **rotationDamp / rotationLerp** `slider (0–1)` — how quickly rotation settles.
- ⚙️ **textEnter/LeaveDuration** `slider (s)` — card-detail text in/out speed.
- ⚙️ **textStagger** `slider (s)` — delay between characters of the revealed text.

## 2. elevate-navbar
`components/elevate-navbar/ElevateDesktopNav.jsx`
- ⚙️ **navTextDuration** `slider (s)` — nav link hover animation speed.
- ⚙️ **ctaDuration** `slider (s)` — CTA button hover fill speed.
- ⚙️ **dimmedTextColor / activeTextColor** `color` — inactive vs hovered link color.
- ⚙️ **defaultCtaBackground / hoverCtaBackground** `color` — CTA button bg (idle vs hover).
- ⚙️ **dropdownItemOffsetY** `slider (px)` — vertical slide distance of dropdown items.
- ⚙️ **dropdownPointerDelay** `slider (s)` — stagger between dropdown items appearing.

## 3. circular-split-roll
`components/circular-split-roll/CircularSplitRollComp.jsx`
- ✅ **leftRadiusX / leftRadiusY** `slider` — radius of the left orbital ring.
- ✅ **rightRadiusX / rightRadiusY** `slider` — radius of the right orbital ring.
- ✅ **imageCardWidth / imageCardHeight** `slider (px)` — size of orbiting image cards.
- ✅ **scrub** `slider` — scroll-scrub smoothing (higher = laggier).
- ✅ **textCenterScale / textSideScale** `slider` — text scale at center vs edges.
- ✅ **textCenterOpacity / textSideOpacity** `slider (0–1)` — text fade at center vs edges.
- ✅ **imageCenterScale / imageSideScale** `slider` — image scale at center vs edges.
- ✅ **imageCenterOpacity / imageSideOpacity** `slider (0–1)` — image fade at edges.
- ✅ **textFocusStart / textFocusPower** `slider` — how sharply the centered text pops.
- ✅ **imageFocusStart / imageFocusPower** `slider` — how sharply the centered image pops.
- ✅ **titleSize** `text` — clamp() font size of titles.

## 4. chess-grid-transition
`components/chess-grid-transition/ChessGridTransition.jsx`
- ✅ **enableContentShift** `toggle` — whether inner content shifts during the wipe.
- ⚙️ **cols / rows** `slider` — grid density of the chessboard tiles (desktop/tablet/mobile).
- ⚙️ **overlap** `slider` — how much rows overlap during the sweep.
- ⚙️ **tile delay factor** `slider (s)` — per-row/col stagger (currently `0.1`).
- ⚙️ **tile duration** `slider (s)` — individual tile flip duration (currently `0.8`).
- ⚙️ **ease** `select` — power2.out / in etc.

## 5. phantom-image-trail
`components/phantom-image-trail/index.jsx`
- ✅ **imageMultiplier** `slider` — how many trailing copies spawn per move.
- ✅ **maxStartRotation / maxExitRotation** `slider (deg)` — random rotation on spawn/exit.
- ✅ **idleDelay** `slider (ms)` — wait before idle-mode pops trigger.
- ✅ **popOutDuration / fadeOutDuration** `slider (s)` — image appear/disappear speed.
- ✅ **idlePopOutMultiplier / idleFadeMultiplier** `slider` — slow-mo factor when idle.
- ✅ **startScale / endScale / exitScale** `slider` — image scale keyframes.
- ✅ **lerpFactor** `slider (0–1)` — trail follow smoothing.
- ✅ **triggerDistanceThreshold** `slider (px)` — mouse distance needed to spawn a new image.

## 6. animated-faq
`components/animated-faq/index.jsx`
- ✅ **allowMultiple** `toggle` — allow multiple items open at once.
- ✅ **defaultOpen / defaultOpenItems** `toggle` — items open on load.
- ✅ **duration** `slider (s)` — open/close expand speed.
- ✅ **iconSize** `slider (px)` — the +/– or chevron icon size.
- ✅ **iconStrokeWidth** `slider` — icon line thickness.
- ⚙️ **ease** `select` — reveal easing (currently power3.out).

## 7. immersive-full-screen-nav
`components/immersive-full-screen-navigation/FullscreenNav.jsx` + `CustomNavbar.jsx`
- ✅ **overlayBg** `color` — fullscreen overlay background.
- ✅ **linkColor / linkHoverColor** `color` — menu link idle vs hover color.
- ✅ **headerOpenColor** `color` — header color when menu is open.
- ✅ **openDuration / closeDuration** `slider (s)` — overlay open/close speed.
- ✅ **delay** (navbar) `slider (s)` — intro entrance delay.
- ⚙️ **linkYOffset / imageInitialScale** `slider` — link slide distance & image zoom-in start.

## 8. link-button
`components/link-button/index.jsx`
- ✅ **textColor** `color` — link text color.
- ✅ **clickedColor** `color` — color flash on click (default `#ff6b00`).
- ✅ **iconClassName** — icon styling; ⚙️ rotate amount is fixed.
- ⚙️ **icon rotation / transition duration** `slider (ms)` — hover icon-rotate speed (300ms).

## 9. arrow-fill-button
`components/arrow-fill-button/index.jsx`
- ✅ **bgColor / textColor** `color` — idle button background & text.
- ✅ **fillBgColor / fillTextColor** `color` — the sweeping fill bg & text.
- ✅ **hoverFillBgColor / hoverFillTextColor** `color` — hover fill colors.
- ⚙️ **animationDuration** `slider (ms)` — fill sweep speed (currently 450ms).

## 10. overflow-stagger-text
`components/overflow-stagger-text/index.jsx`
- ✅ **delay** `slider (s)` — start delay of the reveal.
- ✅ **stagger** `slider (s)` — gap between each character rising.
- ⚙️ **initialYPercent** `slider` — how far below the mask chars start (100%).
- ⚙️ **initialRotation** `slider (deg)` — per-char tilt on entry (8°).
- ⚙️ **duration** `slider (s)` — per-char rise duration (0.5s).
- ⚙️ **ease** `select` — power3.out etc.

## 11. scramble-link-button
`components/scramble-link-button/index.jsx`
- ✅ **hoverColor** `color` — text color on hover (default `#ff6b00`).
- ✅ **scrambleDuration** `slider (ms)` — total scramble length (1000ms).
- ⚙️ **stepMs** `slider (ms)` — glyph swap interval (50ms).
- ⚙️ **revealStagger** `slider` — how fast letters lock into place (1.4).
- ⚙️ **glyphs** `text` — character pool used while scrambling.

## 12. rotation-slider
`components/rotation-slider/RotationSliderComp.jsx`
- ⚙️ **step** `slider` — angular spacing between cards (desktop/tablet/mobile).
- ⚙️ **rotateIn / rotateOut** `slider (deg)` — incoming vs outgoing card rotation.
- ⚙️ **rotateXNegative / rotateXPositive** `slider (deg)` — vertical tilt of cards.
- ⚙️ **perspective** `slider (px)` — 3D depth intensity (1200px).

## 13. sticky-content-wrapper
`components/sticky-content-wrapper/StickyContentComp.jsx`
- ✅ **contentEnterYPercent / contentExitYPercent** `slider` — text slide-in/out distance.
- ✅ **contentTransitionDuration** `slider (s)` — text crossfade speed.
- ✅ **contentDelay** `slider (s)` — delay before text swaps.
- ✅ **stepGap** `slider` — scroll length allotted to each step.
- ✅ **initialImageScale / activeImageScale / exitImageScale** `slider` — image zoom keyframes.

## 14. block-transition
`components/block-transition/index.jsx`
- ✅ **color** `color` — the covering blocks' color (default `#000000`).
- ⚙️ **rows** `slider` — number of block columns/rows (5).
- ⚙️ **staggerDelay** `slider (s)` — gap between blocks (0.12).
- ⚙️ **coverDuration / revealDuration** `slider (s)` — cover vs reveal speed.
- ⚙️ **shiftScaleOut / shiftScaleIn** `slider` — content scale during transition.
- ⚙️ **shiftBlur** `slider (px)` — content blur amount during transition (4px).

## 15. spider-particles
`components/spider-particles/index.jsx`
- ✅ **particleCount** `slider` — number of particles (180).
- ✅ **gridGap** `slider` — spacing between particles.
- ✅ **particleSize** `slider` — dot size (20).
- ✅ **mouseConnectDist** `slider (px)` — max distance for web lines to draw (160).
- ✅ **spotlightRadius** `slider (px)` — cursor spotlight reach (300).
- ✅ **glowColor / particleColor / webColor / centerColor** `color` — all particle/line colors.
- ⚙️ **lerpSpeed / fadeSpeed** `slider (0–1)` — follow smoothing & fade-in rate.

## 16. pixelated-image-effect
`components/pixelated-image-effect/index.jsx`
- ✅ **size** `slider` — pixel block size / mosaic coarseness (default 16).
- ⚙️ **corner radius** — derived from `size/2`; could be its own control.

## 17. interactive-blur-reveal
`components/interactive-blur-reveal/index.jsx`
- ⚙️ **trailRadius / trailSoftRadius** `slider (px)` — size & softness of the reveal brush (180/210).
- ⚙️ **trailLineWidth** `slider (px)` — thickness of the drawn trail (190).
- ⚙️ **maskFadeAlpha / maskIdleFadeAlpha** `slider (0–1)` — how fast the blur re-covers.
- ⚙️ **pointerLerpFactor** `slider` — pointer smoothing.
- ⚙️ **blur radius** `slider` — strength of the gaussian blur (in shader `blur21`).

## 18. numeric-tunnel
`components/numeric-tunnel/NumericTunnelLoader.jsx` (`TUNNEL_CONFIG`)
- ⚙️ **ringCount** `slider` — number of number rings in flight (5).
- ⚙️ **countPerRing** `slider` — digits per ring (10).
- ⚙️ **ringRadius** `slider` — ring diameter (2).
- ⚙️ **ringStartScale / ringEndScale** `slider` — near/far scale of rings (0.01→8).
- ⚙️ **ringRotateSpeed** `slider` — spin speed (1.2).
- ⚙️ **ringFadeInPhase / ringFullVisiblePhase / ringFadeOutPhase** `slider (0–1)` — fade timing along the tunnel.
- ⚙️ **ringFontSize / ringLetterSpacing** `slider` — digit type size & tracking.
- ⚙️ **textColor / backgroundColor** `color` — digit & scene colors.
- ⚙️ **crossfadeDuration / canvasFadeDuration** `slider` — loader→scene fade timings.
- ⚙️ **loaderTickInterval / loaderStartDelay** `slider (ms)` — counter speed & start delay.

## 19. rectangular-text-reveal
`components/rectangular-text-reveal/index.jsx`
- ✅ **baseColor** `color` — text color (default `#ea580c`).
- ✅ **overlayColor** `color` — the sweeping cover bar color (`#ffffff`).
- ✅ **stagger** `slider (s)` — delay between lines (0.2).
- ✅ **coverDuration / revealDuration** `slider (s)` — cover vs reveal speed.
- ✅ **overlayEnterDuration / overlayExitDuration** `slider (s)` — bar in/out speed.
- ✅ **insetX / insetY** `text (em)` — cover bar padding around text.
- ✅ **direction** `select` — left / right / up / down sweep.
- ✅ **delay** `slider (s)` — start delay.
- ✅ **triggerStart** `text` — ScrollTrigger start position.

## 20. horizontal-feature-reveal
`components/horizontal-feature-reveal/HorizontalFeatureRevealComp.jsx`
- ⚙️ **scatter yPercent/xPercent** `slider` — random initial offset of cards.
- ⚙️ **reveal duration** `slider (s)` — no./title/content/image fade speed (0.7).
- ✅ **per-card start/end triggers** `text` — ScrollTrigger positions for no/title/content/img.

## 21. dotted-grid
`components/dotted-grid/index.jsx`
- ⚙️ **spacing** `slider (px)` — gap between dots (24).
- ⚙️ **baseRadius** `slider (px)` — resting dot size (7.2).
- ⚙️ **mouseRadius** `slider (px)` — cursor influence radius (380).
- ⚙️ **trailLength** `slider` — how many history points the trail keeps (456).
- ⚙️ **trailRadius** `slider (px)` — trail reach (230).
- ⚙️ **trailFadeMs** `slider (ms)` — how long the trail lingers (1200).
- ⚙️ **randomTime / collectTime / shapeHoldTime** `slider (s)` — shape-morph cycle timings.
- ⚙️ **totalShapes** `slider` — number of shapes cycled (5).

## 22. stack-loader
`components/stack-loader/index.jsx`
- ⚙️ **imageEntryYPercent** `slider` — how far images fly in from (500%).
- ⚙️ **textRotateXStart** `slider (deg)` — text flip start angle (90°).
- ⚙️ **textStagger** `slider (s)` — per-letter reveal gap (0.08).
- ⚙️ **stackScaleStep / stackYPercentStep** `slider` — offset between stacked cards.
- ⚙️ **spreadYPercentStep** `slider` — spacing when cards spread out (110).
- ⚙️ **imageFadeStagger** `slider (s)` — stagger of image fades.
- ⚙️ **intro ease** `text` — cubic-bezier of the intro.

## 23. directional-menu
`components/directional-menu/DirectionalMegaMenu.jsx`
- ✅ **closeDelay** `slider (ms)` — grace period before menu closes (180).
- ✅ **panelGap** `slider (px)` — gap between trigger and panel.
- ✅ **animation.duration** `slider (s)` — panel swap speed (0.26).
- ✅ **animation.ease** `select` — panel easing (power2.out).
- ⚙️ **heightDuration / heightEase** `slider / select` — panel height morph timing.

## 24. hover-stack
`components/hover-stack/HoverStackComp.jsx`
- ✅ **cardWidth / cardHeight** `slider (px)` — card dimensions (280×360).
- ✅ **overlap** `slider (px)` — how much stacked cards overlap (92).
- ✅ **hoverLift** `slider (px)` — how far the hovered card lifts (28).
- ✅ **pushDistance** `slider (px)` — how far neighbors push aside (110).
- ⚙️ **presetRotations** `slider (deg)` — the scattered tilt of each card.

## 25. interactive-list-preview
`components/interactive-list-preview/InteractiveListPreviewComp.jsx`
- ⚙️ **activeRowTextColor / inactiveRowTextColor** `color` — row text hovered vs idle (`#000`/`#fff`).
- ⚙️ **highlightAnimationDuration** `slider (s)` — highlight bar move speed (0.4).
- ⚙️ **imageRevealDuration / imageHideDuration** `slider (s)` — preview image in/out speed.
- ⚙️ **imageOffsetMultiplier** `slider` — how far the image trails the cursor (20).
- ⚙️ **rowTextAnimationDuration** `slider (s)` — row color transition speed (0.3).

## 26. text-convergence
`components/text-convergence/index.jsx`
- ⚙️ **characterYPercent min/max** `slider` — vertical scatter range of chars (±200).
- ⚙️ **characterRotation min/max** `slider (deg)` — rotation scatter of chars (±20).
- ⚙️ **characterEase** `text` — settle easing (`elastic.out(1,0.8)`).
- ⚙️ **introFadeDistance** `slider (px)` — intro element fade travel (120).
- ⚙️ **height (vh)** `slider` — scroll length driving the convergence (600vh, clamps 300–2000).

## 27. zoom-slider
`components/zoom-slider/ZoomSliderComp.jsx`
- ⚙️ **scrollPerPx** `slider` — scroll → movement sensitivity.
- ⚙️ **lerpFactor** `slider (0–1)` — scroll smoothing (0.08).
- ⚙️ **dragLerpFactor** `slider (0–1)` — drag smoothing (0.22).
- ⚙️ **momentumFriction** `slider (0–1)` — how long momentum coasts (0.92).
- ⚙️ **cardWidthMin / cardWidthMax** `slider (px)` — smallest & largest card size (zoom range).
- ⚙️ **cardHeightMin/Max** `slider (px)` — card height range.

## 28. gooey-counter
`components/gooey-counter/index.jsx`
- ⚙️ **cols / rows** `slider` — resolution of the gooey pixel grid (22×13).
- ⚙️ **cellMax** `slider (px)` — max cell size (48).
- ⚙️ **transitionMs** `slider (ms)` — morph speed between numbers (480).
- ⚙️ **numberDwellMs / randomDwellMs** `slider (ms)` — hold time on a number vs noise.
- ⚙️ **rangeMin / rangeMax** `slider` — counting range (0→10).
- ⚙️ **bg** `color` — background (`#d1d1d1`).
- ⚙️ **ink** `color` — digit color (`#111`).
- ⚙️ **gridStroke** `color` — grid line color.

## 29. fractal-glass
`components/fractal-glass/index.jsx`
- ✅ **stripesFrequency** `slider` — number of glass stripes (40).
- ✅ **glassStrength** `slider` — refraction intensity (2.0).
- ✅ **glassSmoothness** `slider` — edge softness between stripes (0.014).
- ✅ **parallaxStrength** `slider` — mouse parallax amount (0.15).
- ✅ **distortionMultiplier** `slider` — extra distortion at edges (8.0).
- ✅ **edgePadding** `slider` — inner padding of the effect (0.12).
- ✅ **mediaType** `select` — image vs video source.

## 30. milky-way
`components/milky-way/index.jsx` (`CFG` / `SMOKE_CFG`) + `EdgeBlurEffect.jsx`
- ⚙️ **maxRadius / holeRadius** `slider` — galaxy size & central hole size.
- ⚙️ **arms** `slider` — number of spiral arms.
- ⚙️ **spiralTightness** `slider` — how tightly arms wind (10.75).
- ⚙️ **armWidth / diskHeight** `slider` — arm thickness & disk flatness.
- ⚙️ **coreRadius / coreHeight** `slider` — bright core size.
- ⚙️ **baseSize / sparkleSize** `slider` — particle & sparkle point size.
- ⚙️ **twinkleSpeed** `slider` — star twinkle rate (4.5).
- ⚙️ **colorParticleRatio** `slider (0–1)` — fraction of colored sparkle stars.
- ⚙️ **colors.core / mid / outer + sparkleA–E** `color` — the full galaxy palette.
- ⚙️ **colorLevels.core/mid/outer/sparkle** `slider` — per-zone brightness.
- ✅ **blurType** `select` — EdgeBlur `classic` vs `frosted`.
- ✅ **blurStrength** `slider` — edge blur/vignette intensity (1.0).
- ✅ **blurStart** `slider (0–1)` — where the edge blur begins (0.25).

## 31. split-canvas
`components/split-canvas/SplitCanvasComp.jsx`
- ⚙️ **numSlices** `slider` — number of vertical shatter slices (32).
- ⚙️ **canvasSize** `slider (px)` — render resolution / stage size.
- ⚙️ **sectionHeight** `slider (vh)` — scroll length per image transition.
- ⚙️ **scrub / transition curve** `slider` — how transition progress maps to scroll.

## 32. number-counter
`components/number-counter/NumberCounterOne.jsx` (+ Two/Three)
- ✅ **textColor** `color` — digit color.
- ✅ **textSize** `text` — Tailwind text size class (e.g. `text-[5vw]`).
- ✅ **fontWeight** `select` — normal / medium / bold etc.
- ⚙️ **duration** `slider (s)` — digit roll-up speed (2s).
- ⚙️ **ease** `select` — roll easing (power1.out).
- ⚙️ **prefix / suffix / superSuffix** `text` — symbols around the number ($, %, +).
