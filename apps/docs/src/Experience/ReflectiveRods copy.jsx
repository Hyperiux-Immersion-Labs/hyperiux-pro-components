'use client'
import { Environment, RoundedBox, MeshReflectorMaterial } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React from 'react'
import RodsGroup1 from './RodsGroup1'
import RodsGroup2 from './RodsGroup2'

// Helper: degrees to radians
const ctr = (degrees) => {
    return degrees * (Math.PI / 180)
}


export default function ReflectiveRods() {
    return (
        <section
            className="h-[115vh] w-full z-50 absolute bottom-0 left-0 flex flex-col items-center justify-center pointer-events-none"
            id="reflectiveRoadsCanvas"
        >
            <Canvas
                camera={{ fov: 55, position: [0, 0.3, 8] }}
                gl={{ preserveDrawingBuffer: true }}
                style={{
                    // center the canvas content explicitly
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {/* <Environment preset='city' /> */}
                <RodsGroup1 ctr={ctr} />
                <RodsGroup2 ctr={ctr} />
            </Canvas>

        </section>
    )
}
