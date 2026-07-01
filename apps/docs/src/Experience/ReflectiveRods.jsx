'use client'

import { Environment, Instances, RoundedBoxGeometry } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { usePathname } from 'next/navigation'
import React, { useMemo, useEffect, useRef, useState } from 'react'
import RodsGroup1 from './RodsGroup1'
import RodsGroup2 from './RodsGroup2'
import { createRollState, ROLL_SENSITIVITY } from './rollDrive'

const ctr = (degrees) => degrees * (Math.PI / 180)

function RenderKickstart({ active }) {
    const invalidate = useThree((state) => state.invalidate)

    useEffect(() => {
        if (!active) return

        invalidate()

        let frame = 0
        let rafId = 0
        const tick = () => {
            invalidate()
            frame += 1
            if (frame < 8) rafId = requestAnimationFrame(tick)
        }
        rafId = requestAnimationFrame(tick)

        return () => cancelAnimationFrame(rafId)
    }, [active, invalidate])

    return null
}

// A pointer surface that reads drag over its child rods and feeds the motion
// into `state` as roll. It doesn't transform anything itself — the rods apply
// the roll around their own longitudinal axis (see rollDrive.js), so they stay
// in place and just spin, exactly like the ambient animation.
function RollDragSurface({ stateRef, active, children }) {
    const lastY = useRef(0)

    useEffect(() => {
        if (!active) stateRef.current.dragging = false
    }, [active, stateRef])

    const handlePointerDown = (e) => {
        e.stopPropagation()
        e.target.setPointerCapture(e.pointerId)
        stateRef.current.dragging = true
        stateRef.current.velocity = 0
        stateRef.current.pendingDelta = 0
        lastY.current = e.clientY
    }

    const handlePointerMove = (e) => {
        if (!stateRef.current.dragging) return
        e.stopPropagation()
        // Vertical swipe across the bars rolls them around their length.
        const dy = e.clientY - lastY.current
        lastY.current = e.clientY
        stateRef.current.pendingDelta += dy * ROLL_SENSITIVITY
    }

    const handlePointerUp = (e) => {
        e.stopPropagation()
        stateRef.current.dragging = false
        if (e.target.hasPointerCapture?.(e.pointerId)) {
            e.target.releasePointerCapture(e.pointerId)
        }
    }

    return (
        <group
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {children}
        </group>
    )
}

function RodsScene({ active }) {
    const commonProps = useMemo(
        () => ({
            radius: 0.18,
            smoothness: 6,
            materialProps: {
                color: '#ffffff',
                metalness: 1.0,
                roughness: 0.1,
                clearcoat: 1.0,
                clearcoatRoughness: 0.0,
                envMapIntensity: 4.0,
                iridescence: 1.0,
                iridescenceIOR: 2.4,
                iridescenceThicknessRange: [100, 600],
            },
        }),
        [],
    )

    const roll1 = useRef(null)
    const roll2 = useRef(null)
    if (roll1.current == null) roll1.current = createRollState()
    if (roll2.current == null) roll2.current = createRollState()

    return (
        <>
            <RenderKickstart active={active} />
            <Environment files="/studio.exr" />
            <ambientLight intensity={0.5} />
            <pointLight
                position={[-10, 5, 5]}
                color="#00e5ff"
                intensity={8}
                distance={30}
                decay={2}
            />
            <pointLight
                position={[10, 5, 5]}
                color="#ff007f"
                intensity={8}
                distance={30}
                decay={2}
            />
            <pointLight position={[0, 8, 10]} color="#ffffff" intensity={3} />

            <Instances limit={6}>
                {(RodInstance) => (
                    <>
                        <RoundedBoxGeometry
                            args={[1, 1, 1]}
                            radius={commonProps.radius}
                            smoothness={commonProps.smoothness}
                        />
                        <meshPhysicalMaterial {...commonProps.materialProps} />
                        <RollDragSurface stateRef={roll1} active={active}>
                            <RodsGroup1
                                ctr={ctr}
                                RodInstance={RodInstance}
                                rollStateRef={roll1}
                                active={active}
                            />
                        </RollDragSurface>
                        <RollDragSurface stateRef={roll2} active={active}>
                            <RodsGroup2
                                ctr={ctr}
                                RodInstance={RodInstance}
                                rollStateRef={roll2}
                                active={active}
                            />
                        </RollDragSurface>
                    </>
                )}
            </Instances>
        </>
    )
}

export default function ReflectiveRods() {
    const pathname = usePathname()
    const containerRef = useRef(null)
    const [inView, setInView] = useState(false)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const syncVisibility = () => {
            const rect = el.getBoundingClientRect()
            return rect.bottom > 0 && rect.top < window.innerHeight
        }

        // IntersectionObserver can miss the initial state after client navigations
        setInView(syncVisibility())

        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0, rootMargin: '120px 0px' },
        )
        observer.observe(el)

        return () => observer.disconnect()
    }, [pathname])

    return (
        <section
            ref={containerRef}
            className="h-[200vh] max-md:hidden w-full z-999 absolute bottom-0 left-0 flex flex-col items-center justify-center"
            id="reflectiveRoadsCanvas"
        >
            <Canvas
                key={pathname}
                frameloop={inView ? 'always' : 'never'}
                camera={{ fov: 55, position: [0, 0.3, 8] }}
                dpr={[0.8, 1]}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pointerEvents: 'auto',
                }}
            >
                <RodsScene active={inView} />
            </Canvas>
        </section>
    )
}
