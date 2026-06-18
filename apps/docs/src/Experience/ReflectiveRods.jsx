'use client'

import { Environment, Instances, RoundedBoxGeometry } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { usePathname } from 'next/navigation'
import React, { useMemo, useEffect, useRef, useState } from 'react'
import RodsGroup1 from './RodsGroup1'
import RodsGroup2 from './RodsGroup2'

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

function RodsGroupWrapper({ mouse, RodInstance, active }) {
    const groupRef = useRef()

    useFrame(() => {
        if (!active || !groupRef.current) return

        const targetRotX = mouse.current.y * 0.05
        const targetRotY = mouse.current.x * 0.05

        groupRef.current.rotation.x +=
            (targetRotX - groupRef.current.rotation.x) * 0.05
        groupRef.current.rotation.y +=
            (targetRotY - groupRef.current.rotation.y) * 0.05
    })

    return (
        <group ref={groupRef}>
            <RodsGroup1 ctr={ctr} RodInstance={RodInstance} />
            <RodsGroup2 ctr={ctr} RodInstance={RodInstance} />
        </group>
    )
}

function RodsScene({ mouse, active }) {
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
                        <RodsGroupWrapper
                            mouse={mouse}
                            RodInstance={RodInstance}
                            active={active}
                        />
                    </>
                )}
            </Instances>
        </>
    )
}

export default function ReflectiveRods() {
    const pathname = usePathname()
    const containerRef = useRef(null)
    const mouse = useRef({ x: 0, y: 0 })
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

    useEffect(() => {
        if (!inView) {
            mouse.current.x = 0
            mouse.current.y = 0
            return
        }

        const handleMouseMove = (e) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
            mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
        }

        const handleMouseLeave = () => {
            mouse.current.x = 0
            mouse.current.y = 0
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseleave', handleMouseLeave)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [inView])

    return (
        <section
            ref={containerRef}
            className="h-[200vh] max-md:hidden w-full z-50 absolute bottom-0 left-0 flex flex-col items-center justify-center pointer-events-none"
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
                }}
            >
                <RodsScene mouse={mouse} active={inView} />
            </Canvas>
        </section>
    )
}
