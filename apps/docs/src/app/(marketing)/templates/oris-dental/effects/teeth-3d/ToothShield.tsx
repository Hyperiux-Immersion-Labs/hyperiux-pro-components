'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { useControls, folder } from 'leva'
import { buildToothShell } from './toothShellGeometry'
import { createToothShieldMaterial, MAX_HITS } from './toothShieldMaterial'

export interface ToothShieldProps {
    /** The loaded GLB root — the shield surface is a copy of its geometry. */
    source: THREE.Object3D
    color?: string
    edgeColor?: string
    /** Thickness of the layer over the enamel, as a fraction of the model size. */
    inflate?: number
    opacity?: number
    hexOpacity?: number
    hexScale?: number
    /** Rate and strength of the per-cell twinkle across the hex grid. */
    flashSpeed?: number
    flashIntensity?: number
    /** Scale of the dissolve noise. Higher = finer, more broken-up reveal. */
    noiseScale?: number
    fresnelStrength?: number
    flowIntensity?: number
    /** Height at which the shield has fully faded in, -1 = base, 1 = top of the crown. */
    fadeStart?: number
    revealDuration?: number
    /**
     * Metalness above this is treated as the titanium post and gets no shield.
     * glTF packs metalness in the blue channel of the metallicRoughness map.
     */
    metalThreshold?: number
    metalSoftness?: number
    /** Hover spotlight controls */
    hoverRadius?: number
    hoverIntensity?: number
    /** How strongly a ripple lights the shield up on click. */
    hitIntensity?: number
    hitAlpha?: number
    /** Ripples that fire on their own, the same effect a click produces. */
    autoPulse?: boolean
    autoPulseInterval?: number
}

/**
 * Hex-grid energy shield laid over the tooth with live Leva GUI controls.
 */
export default function ToothShield({
    source,
    color: defaultColor = '#3365e2',
    edgeColor: defaultEdgeColor = '#a8c4ff',
    inflate: defaultInflate = 0.0,
    opacity: defaultOpacity = 0.72,
    hexOpacity: defaultHexOpacity = 0.13,
    hexScale: defaultHexScale = 8.7,
    flashSpeed: defaultFlashSpeed = 1.85,
    flashIntensity: defaultFlashIntensity = 0.07,
    noiseScale: defaultNoiseScale = 7.0,
    fresnelStrength: defaultFresnelStrength = 1.9,
    flowIntensity: defaultFlowIntensity = 2.8,
    fadeStart: defaultFadeStart = 1.0,
    revealDuration: defaultRevealDuration = 1.4,
    metalThreshold: defaultMetalThreshold = 0.13,
    metalSoftness: defaultMetalSoftness = 0.5,
    hoverRadius: defaultHoverRadius = 0.5,
    hoverIntensity: defaultHoverIntensity = 1.05,
    hitIntensity: defaultHitIntensity = 1.2,
    hitAlpha: defaultHitAlpha = 0.35,
    autoPulse: defaultAutoPulse = false,
    autoPulseInterval: defaultAutoPulseInterval = 8.0,
}: ToothShieldProps) {
    // ── Leva Controls ─────────────────────────────────────────────────────────
    const [controls] = useControls('Tooth Shield', () => ({
        'Appearance': folder({
            color: defaultColor,
            edgeColor: defaultEdgeColor,
            opacity: { value: defaultOpacity, min: 0, max: 1, step: 0.01 },
            inflate: { value: defaultInflate, min: 0, max: 0.03, step: 0.001 },
            fadeStart: { value: defaultFadeStart, min: -1, max: 1, step: 0.01 },
        }),
        'Hex Grid': folder({
            hexOpacity: { value: defaultHexOpacity, min: 0, max: 1, step: 0.01 },
            hexScale: { value: defaultHexScale, min: 1, max: 20, step: 0.1 },
            flashSpeed: { value: defaultFlashSpeed, min: 0, max: 3, step: 0.05 },
            flashIntensity: { value: defaultFlashIntensity, min: 0, max: 1, step: 0.01 },
        }),
        'Hover Effect': folder({
            hoverRadius: { value: defaultHoverRadius, min: 0.1, max: 1.5, step: 0.05 },
            hoverIntensity: { value: defaultHoverIntensity, min: 0, max: 3, step: 0.05 },
        }),
        'Noise & Flow': folder({
            noiseScale: { value: defaultNoiseScale, min: 0.5, max: 10, step: 0.1 },
            fresnelStrength: { value: defaultFresnelStrength, min: 0, max: 5, step: 0.05 },
            flowIntensity: { value: defaultFlowIntensity, min: 0, max: 10, step: 0.1 },
        }),
        'Metal Mask': folder({
            metalThreshold: { value: defaultMetalThreshold, min: 0, max: 1, step: 0.01 },
            metalSoftness: { value: defaultMetalSoftness, min: 0.01, max: 0.5, step: 0.01 },
        }),
        'Click Impact & Pulses': folder({
            hitIntensity: { value: defaultHitIntensity, min: 0, max: 5, step: 0.05 },
            hitAlpha: { value: defaultHitAlpha, min: 0, max: 1, step: 0.01 },
            autoPulse: defaultAutoPulse,
            autoPulseInterval: { value: defaultAutoPulseInterval, min: 0.5, max: 10, step: 0.1 },
        }),
        'Reveal': folder({
            revealDuration: { value: defaultRevealDuration, min: 0.2, max: 5, step: 0.1 },
        }),
    }))

    const meshRef = useRef<THREE.Mesh | null>(null)
    const { gl, camera } = useThree()

    const shell = useMemo(() => buildToothShell(source, { inflate: controls.inflate }), [source, controls.inflate])

    const material = useMemo(
        () => createToothShieldMaterial({ color: controls.color, edgeColor: controls.edgeColor }),
        [controls.color, controls.edgeColor],
    )

    const clock = useRef({ time: 0, slot: 0, nextPulse: 2.6 })
    const hoverState = useRef({
        targetPos: new THREE.Vector3(),
        currentPos: new THREE.Vector3(),
        strength: 0,
        active: false,
    })

    const scratch = useMemo(
        () => ({
            camera: new THREE.Vector3(),
            point: new THREE.Vector3(),
            normal: new THREE.Vector3(),
            view: new THREE.Vector3(),
        }),
        [],
    )

    useEffect(() => {
        if (!shell) return
        const u = material.uniforms
        u.uCenter.value.copy(shell.center)
        u.uInvSize.value = 2 / shell.size
        u.uMetalnessMap.value = shell.metalnessMap
        u.uUseMetalMask.value = shell.metalnessMap ? 1 : 0
    }, [shell, material])

    useEffect(() => {
        const u = material.uniforms
        u.uOpacity.value = controls.opacity
        u.uHexOpacity.value = controls.hexOpacity
        u.uHexScale.value = controls.hexScale
        u.uFlashSpeed.value = controls.flashSpeed
        u.uFlashIntensity.value = controls.flashIntensity
        u.uNoiseScale.value = controls.noiseScale
        u.uFresnelStrength.value = controls.fresnelStrength
        u.uFlowIntensity.value = controls.flowIntensity
        u.uFadeStart.value = controls.fadeStart
        u.uMetalThreshold.value = controls.metalThreshold
        u.uMetalSoftness.value = controls.metalSoftness
        u.uHoverRadius.value = controls.hoverRadius
        u.uHoverIntensity.value = controls.hoverIntensity
        u.uHitIntensity.value = controls.hitIntensity
        u.uHitAlpha.value = controls.hitAlpha
    }, [material, controls])

    useEffect(() => {
        return () => {
            shell?.geometry.dispose()
            material.dispose()
        }
    }, [shell, material])

    // ── Reveal, chained to the loader event ───────────────────────────────────
    useEffect(() => {
        const reveal = { value: 1.05 }
        let tween: gsap.core.Tween | null = null

        const start = () => {
            tween = gsap.to(reveal, {
                value: 0,
                duration: controls.revealDuration,
                delay: 0.35,
                ease: 'power2.inOut',
                onUpdate: () => {
                    material.uniforms.uReveal.value = reveal.value
                },
            })
        }

        if (typeof window !== 'undefined' && (window as any).__orisLoaderFinished) {
            start()
            return () => {
                tween?.kill()
            }
        }

        window.addEventListener('oris-loader-finished', start, { once: true })
        return () => {
            window.removeEventListener('oris-loader-finished', start)
            tween?.kill()
        }
    }, [material, controls.revealDuration])

    // ── Hits ─────────────────────────────────────────────────────────────────
    const registerHit = useMemo(() => {
        const normalised = new THREE.Vector3()
        return (localPoint: THREE.Vector3) => {
            if (!shell) return
            normalised.copy(localPoint).sub(shell.center).multiplyScalar(2 / shell.size)

            const slot = clock.current.slot % MAX_HITS
            const positions = material.uniforms.uHitPos.value as THREE.Vector3[]
            const times = material.uniforms.uHitTime.value as number[]
            positions[slot].copy(normalised)
            times[slot] = clock.current.time
            clock.current.slot++
        }
    }, [shell, material])

    useEffect(() => {
        if (!shell) return

        const raycaster = new THREE.Raycaster()
        const ndc = new THREE.Vector2()
        const local = new THREE.Vector3()

        const updateRaycast = (clientX: number, clientY: number) => {
            const mesh = meshRef.current
            if (!mesh) return null

            const rect = gl.domElement.getBoundingClientRect()
            if (!rect.width || !rect.height) return null

            ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1
            ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1
            if (ndc.x < -1 || ndc.x > 1 || ndc.y < -1 || ndc.y > 1) return null

            raycaster.setFromCamera(ndc, camera)
            const hit = raycaster.intersectObject(mesh, false)[0]
            if (!hit) return null

            local.copy(hit.point)
            mesh.worldToLocal(local)
            return local
        }

        const onPointerMove = (event: PointerEvent) => {
            const localPoint = updateRaycast(event.clientX, event.clientY)
            if (localPoint && shell) {
                hoverState.current.targetPos.copy(localPoint).sub(shell.center).multiplyScalar(2 / shell.size)
                hoverState.current.active = true
            } else {
                hoverState.current.active = false
            }
        }

        const onPointerDown = (event: PointerEvent) => {
            const localPoint = updateRaycast(event.clientX, event.clientY)
            if (localPoint) {
                registerHit(localPoint)
            }
        }

        const onPointerLeave = () => {
            hoverState.current.active = false
        }

        window.addEventListener('pointermove', onPointerMove, { passive: true })
        window.addEventListener('pointerdown', onPointerDown, { passive: true })
        window.addEventListener('pointerleave', onPointerLeave, { passive: true })
        window.addEventListener('blur', onPointerLeave)

        return () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerdown', onPointerDown)
            window.removeEventListener('pointerleave', onPointerLeave)
            window.removeEventListener('blur', onPointerLeave)
        }
    }, [shell, gl, camera, registerHit])

    useFrame((state, rawDelta) => {
        if (!shell) return
        const delta = Math.min(rawDelta, 1 / 30)
        clock.current.time += delta
        material.uniforms.uTime.value = clock.current.time

        // Smoothly lerp hover position and strength
        const targetStrength = hoverState.current.active ? 1.0 : 0.0
        hoverState.current.strength += (targetStrength - hoverState.current.strength) * Math.min(1, delta * 8.0)
        hoverState.current.currentPos.lerp(hoverState.current.targetPos, Math.min(1, delta * 12.0))

        material.uniforms.uHoverPos.value.copy(hoverState.current.currentPos)
        material.uniforms.uHoverStrength.value = hoverState.current.strength

        if (!controls.autoPulse) return

        clock.current.nextPulse -= delta
        if (clock.current.nextPulse > 0) return
        clock.current.nextPulse = controls.autoPulseInterval * (0.7 + Math.random() * 0.6)

        const mesh = meshRef.current
        if (!mesh) return

        const attribute = shell.geometry.attributes.position as THREE.BufferAttribute
        const normalAttribute = shell.geometry.attributes.normal as THREE.BufferAttribute
        const toCamera = mesh.worldToLocal(scratch.camera.copy(state.camera.position))

        let best = -1
        let bestScore = -Infinity
        for (let attempt = 0; attempt < 12; attempt++) {
            const candidate = Math.floor(Math.random() * attribute.count)
            scratch.point.fromBufferAttribute(attribute, candidate)
            scratch.normal.fromBufferAttribute(normalAttribute, candidate)
            const score =
                scratch.normal.dot(scratch.view.subVectors(toCamera, scratch.point).normalize()) +
                (scratch.point.y - shell.center.y) / shell.size
            if (score > bestScore) {
                bestScore = score
                best = candidate
            }
        }
        if (best < 0) return

        scratch.point.fromBufferAttribute(attribute, best)
        registerHit(scratch.point)
    })

    if (!shell) return null

    return (
        <group position={source.position} quaternion={source.quaternion} scale={source.scale}>
            <mesh ref={meshRef} geometry={shell.geometry} material={material} frustumCulled={false} renderOrder={2} />
        </group>
    )
}
