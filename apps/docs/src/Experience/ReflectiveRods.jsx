'use client'
import { Environment, Instances, RoundedBoxGeometry } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React, { useMemo } from 'react'
import RodsGroup1 from './RodsGroup1'
import RodsGroup2 from './RodsGroup2'

// Helper: degrees to radians
const ctr = (degrees) => {
    return degrees * (Math.PI / 180)
}


export default function ReflectiveRods() {
    const commonProps = useMemo(() => ({
        radius: 0.18, // increased to offset scaling of Y/Z dimensions (0.25 and 0.3)
        smoothness: 10,
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
        }
    }), [])

    return (
        <section
            className="h-[200vh] max-sm:hidden w-full z-50 absolute bottom-0 left-0 flex flex-col items-center justify-center pointer-events-none"
            id="reflectiveRoadsCanvas"
        >
            <Canvas
                camera={{ fov: 55, position: [0, 0.3, 8] }}
                dpr={[1]}
                gl={{ antialias: true, alpha: true }}
                style={{
                    // center the canvas content explicitly
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Environment preset='studio' />
                <ambientLight intensity={0.5} />
                <pointLight position={[-10, 5, 5]} color="#00e5ff" intensity={8} distance={30} decay={2} />
                <pointLight position={[10, 5, 5]} color="#ff007f" intensity={8} distance={30} decay={2} />
                <pointLight position={[0, 8, 10]} color="#ffffff" intensity={3} />
                
                <Instances limit={5}>
                    {(RodInstance) => (
                        <>
                            <RoundedBoxGeometry
                                args={[1, 1, 1]}
                                radius={commonProps.radius}
                                smoothness={commonProps.smoothness}
                            />
                            <meshPhysicalMaterial {...commonProps.materialProps} />
                            <RodsGroup1 ctr={ctr} RodInstance={RodInstance} />
                            <RodsGroup2 ctr={ctr} RodInstance={RodInstance} />
                        </>
                    )}
                </Instances>
            </Canvas>

        </section>
    )
}
