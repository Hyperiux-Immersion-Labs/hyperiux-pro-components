'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import * as THREE from 'three'
import type { Line2 } from 'three/examples/jsm/lines/Line2.js'
import MouseTilt from './MouseTilt'

interface Tooth404Props {
    /** 0 = sad, 1 = smiling. The 404 page flips it while "Back to Home" is hovered or focused. */
    smile: React.RefObject<number>
    reducedMotion: boolean
    /** Called once the first frame is on screen, so the page can play its intro with the tooth in it. */
    onReady?: () => void
}

const FACE_COLOR = '#13314a'
const DEPTH = 0.45
const BEVEL = 0.32
// The front cap of the extrusion, once centred: the face is drawn just above it.
const FACE_Z = DEPTH / 2 + BEVEL + 0.01
// Sits the tooth on the same baseline as the 4s either side of it
const BASE_Y = -0.12

// A classic molar silhouette (two crown lobes, two roots), extruded with a deep
// bevel so it reads as a soft, rounded tooth rather than a flat cut-out.
function buildToothGeometry() {
    const s = new THREE.Shape()
    s.moveTo(-0.95, 0.3)
    s.bezierCurveTo(-1.05, 0.85, -0.75, 1.05, -0.45, 0.98)
    s.bezierCurveTo(-0.25, 0.94, -0.15, 0.82, 0, 0.82)
    s.bezierCurveTo(0.15, 0.82, 0.25, 0.94, 0.45, 0.98)
    s.bezierCurveTo(0.75, 1.05, 1.05, 0.85, 0.95, 0.3)
    s.bezierCurveTo(0.9, -0.1, 0.85, -0.4, 0.75, -0.75)
    s.bezierCurveTo(0.68, -1.05, 0.6, -1.25, 0.45, -1.2)
    s.bezierCurveTo(0.32, -1.15, 0.3, -0.85, 0.22, -0.62)
    s.bezierCurveTo(0.15, -0.45, -0.15, -0.45, -0.22, -0.62)
    s.bezierCurveTo(-0.3, -0.85, -0.32, -1.15, -0.45, -1.2)
    s.bezierCurveTo(-0.6, -1.25, -0.68, -1.05, -0.75, -0.75)
    s.bezierCurveTo(-0.85, -0.4, -0.9, -0.1, -0.95, 0.3)

    const geometry = new THREE.ExtrudeGeometry(s, {
        depth: DEPTH,
        bevelEnabled: true,
        bevelThickness: BEVEL,
        bevelSize: 0.16,
        bevelSegments: 14,
        curveSegments: 64,
    })
    geometry.translate(0, 0, -DEPTH / 2)
    return geometry
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Face points for a given mood (0 sad, 1 happy): worried brows (inner ends up)
// shrink away, the eyes go from dashes to happy arcs, the mouth from a frown to a smile.
function mouthPoints(t: number) {
    const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.3, lerp(-0.12, 0.0, t), FACE_Z),
        new THREE.Vector3(0, lerp(0.12, -0.42, t), FACE_Z),
        new THREE.Vector3(0.3, lerp(-0.12, 0.0, t), FACE_Z)
    )
    return curve.getPoints(24)
}

function browPoints(side: -1 | 1, t: number) {
    const outer = new THREE.Vector3(side * 0.52, 0.46, FACE_Z)
    const inner = new THREE.Vector3(side * 0.24, 0.6, FACE_Z)
    const mid = outer.clone().lerp(inner, 0.5)
    return [mid.clone().lerp(outer, 1 - t), mid.clone().lerp(inner, 1 - t)]
}

function eyePoints(side: -1 | 1, t: number) {
    const x = side * 0.36
    return [
        new THREE.Vector3(x + lerp(0, -0.1, t), lerp(0.2, 0.24, t), FACE_Z),
        new THREE.Vector3(x, lerp(0.28, 0.33, t), FACE_Z),
        new THREE.Vector3(x + lerp(0, 0.1, t), lerp(0.36, 0.24, t), FACE_Z),
    ]
}

const flatten = (points: THREE.Vector3[]) => points.flatMap((p) => [p.x, p.y, p.z])

// Lit by three's procedural studio room: soft reflections with no HDRI to download.
// Attached to the scene declaratively, so nothing mutates the scene from an effect.
function StudioEnvironment() {
    const gl = useThree((state) => state.gl)
    const env = useMemo(() => {
        const pmrem = new THREE.PMREMGenerator(gl)
        const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
        pmrem.dispose()
        return texture
    }, [gl])

    useEffect(() => () => env.dispose(), [env])

    return <primitive object={env} attach='environment' />
}

function Tooth({ smile, reducedMotion, onReady }: Tooth404Props) {
    const geometry = useMemo(() => buildToothGeometry(), [])
    const bodyRef = useRef<THREE.Group>(null)
    const mouthRef = useRef<Line2>(null)
    const leftBrowRef = useRef<Line2>(null)
    const rightBrowRef = useRef<Line2>(null)
    const leftEyeRef = useRef<Line2>(null)
    const rightEyeRef = useRef<Line2>(null)
    const mood = useRef(0)
    const pop = useRef(0)
    const announced = useRef(false)
    const size = useThree((state) => state.size)

    useEffect(() => () => geometry.dispose(), [geometry])

    useFrame((state, rawDelta) => {
        // This frame is drawn right after the callback, so report ready on the next one
        if (!announced.current) {
            announced.current = true
            requestAnimationFrame(() => onReady?.())
        }
        const delta = Math.min(rawDelta, 1 / 30)
        const target = smile.current ?? 0
        const previous = mood.current
        mood.current = reducedMotion ? target : mood.current + (target - mood.current) * Math.min(1, delta * 9)
        if (Math.abs(mood.current - target) < 0.001) mood.current = target

        if (mood.current !== previous) {
            mouthRef.current?.geometry.setPositions(flatten(mouthPoints(mood.current)))
            leftBrowRef.current?.geometry.setPositions(flatten(browPoints(-1, mood.current)))
            rightBrowRef.current?.geometry.setPositions(flatten(browPoints(1, mood.current)))
            leftEyeRef.current?.geometry.setPositions(flatten(eyePoints(-1, mood.current)))
            rightEyeRef.current?.geometry.setPositions(flatten(eyePoints(1, mood.current)))
            for (const brow of [leftBrowRef.current, rightBrowRef.current]) {
                if (brow) brow.visible = mood.current < 0.97
            }
            // A little hop each time it cheers up
            if (target === 1 && previous < 0.05) pop.current = 1
        }

        const body = bodyRef.current
        if (!body || reducedMotion) return
        pop.current = Math.max(0, pop.current - delta * 2.4)
        const hop = Math.sin(pop.current * Math.PI) * 0.12
        const t = state.clock.elapsedTime
        body.position.y = BASE_Y + Math.sin(t * 1.6) * 0.05 + hop
        body.rotation.z = Math.sin(t * 1.1) * 0.04 * (1 - mood.current)
        const squash = 1 + hop * 0.5
        body.scale.set(1 / Math.sqrt(squash), squash, 1)
    })

    // Line2 widths are in pixels, so they follow the canvas to stay in proportion with the digits.
    const lineWidth = Math.max(2, size.width * 0.028)

    return (
        <group ref={bodyRef} position-y={BASE_Y}>
            <mesh geometry={geometry}>
                <meshPhysicalMaterial
                    color='#ffffff'
                    roughness={0.28}
                    clearcoat={1}
                    clearcoatRoughness={0.18}
                    sheen={0.4}
                    sheenColor='#dbe6ff'
                    envMapIntensity={1.1}
                />
            </mesh>
            <Line ref={mouthRef} points={mouthPoints(0)} color={FACE_COLOR} lineWidth={lineWidth} />
            <Line ref={leftBrowRef} points={browPoints(-1, 0)} color={FACE_COLOR} lineWidth={lineWidth} />
            <Line ref={rightBrowRef} points={browPoints(1, 0)} color={FACE_COLOR} lineWidth={lineWidth} />
            <Line ref={leftEyeRef} points={eyePoints(-1, 0)} color={FACE_COLOR} lineWidth={lineWidth * 1.3} />
            <Line ref={rightEyeRef} points={eyePoints(1, 0)} color={FACE_COLOR} lineWidth={lineWidth * 1.3} />
        </group>
    )
}

/** The "0" of the 404: a 3D tooth with a sad face that cheers up on "Back to Home". */
export default function Tooth404({ smile, reducedMotion, onReady }: Tooth404Props) {
    return (
        <Canvas
            camera={{ position: [0, 0, 6.5], fov: 30 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            className='pointer-events-none'
        >
            <ambientLight intensity={0.6} color='#f4f8ff' />
            <directionalLight position={[3, 4, 6]} intensity={1.6} color='#ffffff' />
            <directionalLight position={[-4, -2, 3]} intensity={0.5} color='#cfdcff' />
            <StudioEnvironment />
            {reducedMotion ? (
                <Tooth smile={smile} reducedMotion onReady={onReady} />
            ) : (
                <MouseTilt intensity={10}>
                    <Tooth smile={smile} reducedMotion={false} onReady={onReady} />
                </MouseTilt>
            )}
        </Canvas>
    )
}
