'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import {
  Fn,
  float,
  vec2,
  vec3,
  vec4,
  uniform,
  screenUV,
  smoothstep,
  mix,
  length,
  clamp,
  oneMinus,
  texture,
  atan,
  log,
  max,
  pow,
} from 'three/tsl'

const damp = (current, target, lambda, delta) =>
  current + (target - current) * (1 - Math.exp(-lambda * delta))

const NOISE_URL = '/assets/textures/mask-noise.png'

/**
 * Three anisotropic samples of the R channel, read in log-polar space so the
 * silhouette keeps its shape as the veil grows.
 *
 * No octave is ridged. Folding the field with `abs(n * 2 - 1)` puts a crease
 * wherever it crosses its midpoint, and in log-polar space those creases
 * stretch into the thin filaments that made the veil read as marble rather
 * than smoke.
 *
 * The frequencies stay low and fall off fast for the same reason. Log-polar
 * space compresses without limit toward the corner, so a high radial
 * frequency here is arbitrarily fine detail there -- see `detail` below.
 */
const OCTAVES = [
  { ang: 0.50, rad: 0.50, weight: 0.62, offX: 0.0, offY: 0.0 },
  { ang: 1.30, rad: 0.90, weight: 0.27, offX: 3.1, offY: 1.7 },
  { ang: 2.60, rad: 1.45, weight: 0.11, offX: 7.3, offY: 4.2 },
]

const WEIGHT_SUM = OCTAVES.reduce((sum, o) => sum + o.weight, 0)
const EXPAND_RADIUS = 3.0

// The expansion never reaches progress 2 exactly -- it is exponentially damped,
// so waiting on 2.0 would be waiting forever. What the menu actually needs is
// the moment the ink has swallowed the far corner, which happens well before
// then and can be solved for exactly.
//
// `smoothstep(1, 2, p) * EXPAND_RADIUS` has to clear the furthest point of the
// screen from the veil's origin at the top-right. How far past that point it
// has to reach depends on how settled the silhouette is: below `RELAX_END` the
// turbulence is still displacing the edge by roughly `edgeChaos` in log space,
// so the radius must overshoot; past it `relax` is zero and only the hairline
// feather is left to clear.
const RELAX_END = 1.7
const MARGIN_TURBULENT = 1.45
const MARGIN_SETTLED = 1.02

// Past this the exponential damping crawls, so a threshold up here would read
// as a hang. Only the most extreme portrait viewports get near it.
const COVER_CEILING = 1.9

// Closed-form inverse of smoothstep(0, 1, t).
const inverseSmoothstep = (s) => 0.5 - Math.sin(Math.asin(1 - 2 * s) / 3)

function solveCoverProgress(aspect) {
  const safeAspect = aspect > 0 ? aspect : 1
  // offset = (screenUV.x - 1, screenUV.y / aspect), so the far corner sits at
  // (-1, 1 / aspect).
  const maxRadial = Math.hypot(1, 1 / safeAspect)
  const progressFor = (margin) =>
    1 + inverseSmoothstep(Math.min((maxRadial * margin) / EXPAND_RADIUS, 1))

  const settled = progressFor(MARGIN_SETTLED)
  // A tall viewport is not covered until after the turbulence has already
  // stopped, so it needs no turbulence margin -- and adding one there would
  // push the threshold past what the damping can reach.
  if (settled >= RELAX_END) return Math.min(settled, COVER_CEILING)
  return Math.min(progressFor(MARGIN_TURBULENT), RELAX_END)
}

function VeilPlane({ progressRef, controls, onCoverChange }) {
  const { size } = useThree()

  const localProgress = useRef(0)
  const prevTarget = useRef(0)
  const rampTime = useRef(0)
  const isCovered = useRef(false)

  const coverCallback = useRef(onCoverChange)
  useEffect(() => {
    coverCallback.current = onCoverChange
  }, [onCoverChange])

  const coverProgress = useMemo(
    () => solveCoverProgress(size.width / size.height),
    [size.width, size.height],
  )

  const noiseMap = useMemo(() => {
    const map = new THREE.TextureLoader().load(NOISE_URL)
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.colorSpace = THREE.NoColorSpace
    // The log-polar lookup stretches the map hard along one axis. Isotropic
    // mip selection has to pick a level for the wider footprint, which either
    // aliases into shimmer or over-blurs; anisotropic filtering keeps the
    // gradient clean along both.
    map.anisotropy = 16
    return map
  }, [])

  const material = useMemo(() => {
    const mat = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    })

    const uProgress = uniform(0)
    const uAspect = uniform(1)

    const uWarpAmount = uniform(1.20)
    const uWarpScale = uniform(0.85)
    const uEdgeChaos = uniform(0.44)
    const uCenter = uniform(0.80)
    const uBand = uniform(0.22)
    const uGamma = uniform(1.50)
    const uHoverRadius = uniform(0.21)

    const uInkDark = uniform(0.02)
    const uInkEdge = uniform(0.11)
    const uToneSpread = uniform(0.48)
    const uToneGamma = uniform(2.45)
    const uInkVariation = uniform(0.00)

    const veil = Fn(() => {
      const st = screenUV
      const offset = vec2(st.x.sub(1.0), st.y.div(uAspect))

      const radial = max(length(offset), float(0.001))
      const logR = log(radial)
      const angle = atan(offset.y, offset.x.negate())

      const warpUV = vec2(angle.mul(1.2), logR).mul(uWarpScale)
      const warpSample = texture(noiseMap, warpUV)
      const warp = vec2(
        warpSample.g.sub(0.5),
        warpSample.b.sub(0.5),
      ).mul(uWarpAmount)

      // Toward the corner the log-polar cells shrink without bound, so the
      // finer octaves would resolve into noise dust exactly where the veil is
      // densest. Fade them back to the field midpoint there and let the base
      // octave carry the shape alone.
      const detail = smoothstep(0.04, 0.32, radial)

      let turbulence = float(0)
      OCTAVES.forEach((octave, index) => {
        const uv = vec2(
          angle.mul(octave.ang).add(warp.x.mul(octave.ang * 0.3)).add(octave.offX),
          logR.mul(octave.rad).add(warp.y.mul(octave.rad * 0.3)).add(octave.offY),
        )
        const n = texture(noiseMap, uv).r
        const shaped = index === 0 ? n : mix(float(0.5), n, detail)
        turbulence = turbulence.add(shaped.mul(octave.weight / WEIGHT_SUM))
      })

      const hoverRadius = smoothstep(0.0, 1.0, uProgress).mul(uHoverRadius)
      const expandRadius = smoothstep(1.0, 2.0, uProgress).mul(EXPAND_RADIUS)
      const radius = max(hoverRadius.add(expandRadius), float(0.0001))

      const relax = oneMinus(smoothstep(0.9, 1.7, uProgress))
      const chaos = uEdgeChaos.mul(relax)
      const band = uBand.mul(relax).add(0.004)

      const field = logR.sub(log(radius)).add(turbulence.sub(uCenter).mul(chaos).mul(2.0))
      const visibilityGate = smoothstep(0.0, 0.04, uProgress)

      // Easing the smoothstep a second time flattens the slope at both ends
      // of the feather, so the edge arrives out of nothing instead of starting
      // at a visible angle.
      const raw = oneMinus(smoothstep(band.negate(), band, field))
      const feather = smoothstep(0.0, 1.0, clamp(raw, 0.0, 1.0))
      const density = pow(feather, uGamma).mul(visibilityGate)

      // The core has to settle to a flat value quickly; any gradient still
      // running through the interior shows the octave structure that the
      // silhouette is supposed to be hiding.
      const depth = clamp(field.negate().div(uToneSpread), 0.0, 1.0)
      const ramp = smoothstep(0.0, 1.0, pow(depth, uToneGamma))

      const expansion = smoothstep(1.0, 2.0, uProgress)
      const activeCore = mix(uInkDark, float(0.0), expansion)
      const base = mix(uInkEdge, activeCore, ramp)
      const drift = turbulence
        .sub(uCenter)
        .mul(uInkVariation)
        .mul(relax)
        .mul(oneMinus(ramp))
      const rawTone = clamp(base.add(drift), 0.0, 1.0)
      const tone = mix(rawTone, float(0.0), expansion)

      // Neutral ink. The blue lift that used to sit in the core reads as a
      // colour cast against a grey page -- the reference veil has no hue at
      // all, its channels are equal at every depth.
      const ink = vec3(tone, tone, tone)

      // Premultiplied, and deliberately display-referred -- see the
      // outputColorSpace note in the renderer setup below.
      return vec4(ink.mul(density), density)
    })

    mat.colorNode = veil()
    mat.userData.uProgress = uProgress
    mat.userData.uAspect = uAspect
    mat.userData.tunables = {
      warpAmount: uWarpAmount,
      warpScale: uWarpScale,
      edgeChaos: uEdgeChaos,
      center: uCenter,
      band: uBand,
      gamma: uGamma,
      hoverRadius: uHoverRadius,
      inkDark: uInkDark,
      inkEdge: uInkEdge,
      toneSpread: uToneSpread,
      toneGamma: uToneGamma,
      inkVariation: uInkVariation,
    }

    return mat
  }, [noiseMap])

  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    const { uProgress, uAspect } = material.userData

    const target = progressRef.current

    if (target !== prevTarget.current) {
      prevTarget.current = target
      rampTime.current = 0
    }
    rampTime.current += delta

    const read = (key, fallback) => {
      const value = controls && controls[key]
      return value === undefined || value === null ? fallback : value
    }

    const isRetracting = target < localProgress.current
    let baseLambda
    if (isRetracting) {
      baseLambda = read('retract', 1.4)
    } else if (target <= 1.0) {
      baseLambda = read('hoverSpeed', 0.6)
    } else {
      baseLambda = read('openSpeed', 1.4)
    }

    const rampDuration = isRetracting ? 0.6 : (target <= 1.0 ? 1.6 : 1.2)
    const t = Math.min(rampTime.current / rampDuration, 1.0)
    const floor = 0.04
    const lambda = baseLambda * (floor + (1 - floor) * t * t)

    localProgress.current = damp(localProgress.current, target, lambda, delta)
    uProgress.value = localProgress.current
    uAspect.value = size.width / size.height

    // Edge-triggered: the consumer hears about the crossing, not every frame.
    const covered = localProgress.current >= coverProgress
    if (covered !== isCovered.current) {
      isCovered.current = covered
      if (coverCallback.current) coverCallback.current(covered)
    }

    if (controls) {
      const { tunables } = material.userData
      for (const key in tunables) {
        if (controls[key] !== undefined) tunables[key].value = controls[key]
      }
    }
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <mesh material={material} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}

export default function SoulVeil({ progressRef, frameloop = 'always', controls, onCoverChange }) {
  return (
    <Canvas
      dpr={[1, 2]}
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1, left: -1, right: 1, top: 1, bottom: -1 }}
      frameloop={frameloop}
      className="h-full w-full"
      style={{ pointerEvents: 'none' }}
      gl={async ({ canvas }) => {
        const renderer = new THREE.WebGPURenderer({
          canvas,
          antialias: true,
          alpha: true,
        })

        // The veil writes PREMULTIPLIED alpha and the browser composites the
        // canvas over the page in sRGB. An sRGB output transform encodes the
        // rgb channels and leaves alpha alone, which breaks that premultiply:
        // a wisp at 3% coverage has its colour lifted far more than its
        // alpha, so it composites LIGHTER than the page behind it. That is
        // the milky haze the veil used to spread across the light half.
        // Writing display values with no output transform keeps colour and
        // coverage in step, so the ink uniforms above are plain sRGB greys.
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace
        renderer.toneMapping = THREE.NoToneMapping

        await renderer.init()

        return renderer
      }}
    >
      <VeilPlane progressRef={progressRef} controls={controls} onCoverChange={onCoverChange} />
    </Canvas>
  )
}
