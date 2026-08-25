'use client'

import  { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center, Environment } from '@react-three/drei'
import * as THREE from 'three'
import MouseTilt from './MouseTilt'
import { degToRad } from 'three/src/math/MathUtils.js'

function Model({ url }) {
    const { scene } = useGLTF(url)

    useMemo(() => {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                const upgradeMaterial = (mat) => {
                    return new THREE.MeshPhysicalMaterial({
                        map: mat.map || null,
                        normalMap: mat.normalMap || null,
                        roughnessMap: mat.roughnessMap || null,
                        metalnessMap: mat.metalnessMap || null,
                        aoMap: mat.aoMap || null,
                        color: mat.color ? mat.color.clone() : new THREE.Color('#ffffff'),
                        roughness: 0.12,
                        metalness: 0.05,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.06,
                        reflectivity: 0.95,
                        ior: 1.52,
                        transparent: mat.transparent || false,
                        opacity: mat.opacity !== undefined ? mat.opacity : 1,
                        depthWrite: true,
                    })
                }

                if (Array.isArray(child.material)) {
                    child.material = child.material.map(upgradeMaterial)
                } else {
                    child.material = upgradeMaterial(child.material)
                }
            }
        })
    }, [scene])

    return <primitive object={scene} />
}

function ScrollAnimatedGroup({ children }) {
    const groupRef = useRef()

    useFrame((_, rawDelta) => {
        if (!groupRef.current) return
        const delta = Math.min(rawDelta, 1 / 30)

        // Scroll progress relative to viewport height
        const scrollY = typeof window !== 'undefined' ? window.scrollY || 0 : 0
        const vh = typeof window !== 'undefined' ? window.innerHeight || 800 : 800
        const progress = Math.min(Math.max(scrollY / vh, 0), 1.5)

        const targetRotY = progress * degToRad(120)
        const targetPosY = -progress * 0.2 // goes little down

        // Smooth physics-based lerp
        groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * delta * 5
        groupRef.current.position.y += (targetPosY - groupRef.current.position.y) * delta * 5
    })

    return <group ref={groupRef}>{children}</group>
}

export default function TeethCanvas() {
    return (
        <div className='absolute h-full w-full'>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }}>
                <ambientLight intensity={1.2} />
                <directionalLight position={[10, 10, 10]} intensity={2.5} />
                <directionalLight position={[-10, 8, -5]} intensity={1.5} color="#ffffff" />
                <pointLight position={[0, -5, 5]} intensity={1.0} color="#e0f2fe" />
                <Suspense fallback={null}>
                    <Environment preset="city" />
                    <MouseTilt intensity={8}>
                        <group rotation={[degToRad(20), degToRad(-0), degToRad(0)]} scale={3.5} position={[0, -.7, 0]}>
                            <ScrollAnimatedGroup>
                                <Center>
                                    <group rotation={[0, degToRad(180), 0]}>
                                        <Model url="/templates/oris-detal/teeth.glb" />
                                    </group>
                                </Center>
                            </ScrollAnimatedGroup>
                        </group>
                    </MouseTilt>
                </Suspense>
            </Canvas>
        </div>
    )
}

useGLTF.preload('/templates/oris-detal/teeth.glb')

