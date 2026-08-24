'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Center } from '@react-three/drei'
import MouseTilt from './MouseTilt'
import { degToRad } from 'three/src/math/MathUtils.js'

function Model({ url }) {
    const { scene } = useGLTF(url)
    return <primitive object={scene} />
}

export default function TeethCanvas() {
    return (
        <div className='absolute h-full w-full'>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 10]} intensity={2} />
                <Suspense fallback={null}>
                    <MouseTilt intensity={8}>
                        <group rotation={[degToRad(20), degToRad(-0), degToRad(0)]} scale={3.5} position={[0, -.7, 0]}>
                            <Center>
                                <group rotation={[0,degToRad(180),0]}>

                                    <Model url="/templates/oris-detal/teeth.glb" />
                                </group>
                            </Center>
                        </group>
                    </MouseTilt>
                </Suspense>
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    )
}

useGLTF.preload('/templates/oris-detal/teeth.glb')

