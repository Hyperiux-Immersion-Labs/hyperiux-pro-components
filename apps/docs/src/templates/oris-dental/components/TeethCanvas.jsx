'use client'

import React, { Suspense, useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Center, Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import MouseTilt from './MouseTilt'
import TeethParticleNet from './TeethParticleNet'
import { degToRad } from 'three/src/math/MathUtils.js'

// The GLB is a single mesh sharing one material between the crown and the
// titanium post -- they are separated only by the metallicRoughness texture.
// So the whitening has to be gated per-fragment on metalness rather than per
// mesh, otherwise it washes the implant out too.
const ENAMEL_DESATURATE = 0.35 // 0 = raw texture, 1 = fully neutral grey
const ENAMEL_BRIGHTNESS = 1.05 // lift applied after desaturation
const ENAMEL_TINT = new THREE.Vector3(0.98, 0.99, 1.0) // faint cool cast, dielectric only

function whitenEnamel(mat) {
    mat.onBeforeCompile = (shader) => {
        shader.uniforms.uDesaturate = { value: ENAMEL_DESATURATE }
        shader.uniforms.uBrightness = { value: ENAMEL_BRIGHTNESS }
        shader.uniforms.uTint = { value: ENAMEL_TINT }

        shader.fragmentShader = shader.fragmentShader
            .replace(
                '#include <common>',
                `#include <common>
                uniform float uDesaturate;
                uniform float uBrightness;
                uniform vec3 uTint;`
            )
            // Injected after metalnessmap_fragment, not map_fragment: metalnessFactor
            // is only resolved by that point, and diffuseColor is still untouched.
            .replace(
                '#include <metalnessmap_fragment>',
                `#include <metalnessmap_fragment>
                float enamelMask = 1.0 - clamp(metalnessFactor, 0.0, 1.0);
                float enamelLuma = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
                vec3 enamelWhite = mix(diffuseColor.rgb, vec3(enamelLuma), uDesaturate);
                enamelWhite = clamp(enamelWhite * uBrightness * uTint, 0.0, 1.0);
                diffuseColor.rgb = mix(diffuseColor.rgb, enamelWhite, enamelMask);`
            )
    }

    // Keeps the shader variant from colliding with the untouched cache entry.
    mat.customProgramCacheKey = () => 'oris-enamel'

    return mat
}

function Model({ url }) {
    const { scene } = useGLTF(url)

    useMemo(() => {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                const upgradeMaterial = (mat) => {
                    return whitenEnamel(new THREE.MeshPhysicalMaterial({
                        map: mat.map || null,
                        normalMap: mat.normalMap || null,
                        roughnessMap: mat.roughnessMap || null,
                        metalnessMap: mat.metalnessMap || null,
                        aoMap: mat.aoMap || null,
                        color: mat.color ? mat.color.clone() : new THREE.Color('#ffffff'),
                        // These are multipliers over the maps. The GLB authors both at
                        // 1.0, so anything lower silently flattens the titanium into a
                        // glossy dielectric -- keep the textures in charge where present.
                        roughness: mat.roughnessMap ? 1.0 : 0.35,
                        metalness: mat.metalnessMap ? 1.0 : 0.0,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.25,
                        ior: 2,
                        envMapIntensity: 1.0,
                        transparent: mat.transparent || false,
                        opacity: mat.opacity !== undefined ? mat.opacity : 1,
                        depthWrite: true,
                    }))
                }

                if (Array.isArray(child.material)) {
                    child.material = child.material.map(upgradeMaterial)
                } else {
                    child.material = upgradeMaterial(child.material)
                }
            }
        })
    }, [scene])

    return (
        <>
            <primitive object={scene} />
            <TeethParticleNet source={scene} />
        </>
    )
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

function ModelEntranceGroup({ children }) {
    const groupRef = useRef()
    const animRef = useRef({
        y: -4.5,
        rotY: degToRad(720),
        entered: false,
    })

    useEffect(() => {
        const startEntrance = () => {
            if (animRef.current.entered) return
            animRef.current.entered = true

            gsap.to(animRef.current, {
                y: 0,
                rotY: 0,
                duration: 1.8,
                delay: 0.1,
                ease: 'power3.out',
            })
        }

        if (typeof window !== 'undefined' && window.__orisLoaderFinished) {
            startEntrance()
            return
        }

        window.addEventListener('oris-loader-finished', startEntrance, { once: true })
        return () => window.removeEventListener('oris-loader-finished', startEntrance)
    }, [])

    useFrame(() => {
        if (!groupRef.current) return
        groupRef.current.position.y = animRef.current.y
        groupRef.current.rotation.y = animRef.current.rotY
    })

    return <group ref={groupRef}>{children}</group>
}

function ResponsiveModelGroup({ children }) {
    const { size } = useThree()
    const isMobile = size.width <= 640
    const isTablet = size.width <= 1025

    const scale = isMobile ? 2.0 : isTablet ? 2.5 : 3.5
    const posY = isMobile ? -0.35 : isTablet ? -0.5 : -0.7

    return (
        <group
            rotation={[degToRad(20), degToRad(0), degToRad(0)]}
            scale={scale}
            position={[0, posY, 0]}
        >
            {children}
        </group>
    )
}

export default function TeethCanvas() {
    return (
        <div className='absolute h-full z-100 w-full'>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }}>
                <ambientLight intensity={1.35} color="#f4f8ff" />
                <directionalLight position={[10, 10, 10]} intensity={2.6} color="#ff0000" />
                <directionalLight position={[-10, 8, -5]} intensity={1.6} color="#eef4ff" />
                <pointLight position={[0, -5, 5]} intensity={1.1} color="#e0f2fe" />
                <Suspense fallback={null}>
                    {/* "studio" is a neutral HDRI -- "city" was pushing warm amber into the enamel. */}
                    <Environment preset="studio" environmentIntensity={0.9} />
                    <MouseTilt intensity={8}>
                        <ResponsiveModelGroup>
                            <ScrollAnimatedGroup>
                                <ModelEntranceGroup>
                                    <Center>
                                        <group rotation={[0, degToRad(180), 0]}>
                                            <Model url="/templates/oris-detal/teeth.glb" />
                                        </group>
                                    </Center>
                                </ModelEntranceGroup>
                            </ScrollAnimatedGroup>
                        </ResponsiveModelGroup>
                    </MouseTilt>
                </Suspense>
            </Canvas>
        </div>
    )
}

useGLTF.preload('/templates/oris-detal/teeth.glb')

