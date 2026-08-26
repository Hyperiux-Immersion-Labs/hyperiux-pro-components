import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'

interface MouseTiltProps {
    children: React.ReactNode
    intensity?: number
}

export default function MouseTilt({ children, intensity = 8 }: MouseTiltProps) {
    const groupRef = useRef<THREE.Group | null>(null)

    useFrame((state, rawDelta) => {
        if (!groupRef.current) return

        // Clamped to a 30fps step to prevent frame jump spikes
        const delta = Math.min(rawDelta, 1 / 30)

        // R3F's state.pointer normalizes pointer coordinates to -1..1
        const targetX = -state.pointer.y * degToRad(intensity)
        const targetY = state.pointer.x * degToRad(intensity)

        // Faster lerp towards target rotation (less lag)
        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * delta * 6
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * delta * 6
    })

    return (
        <group ref={groupRef}>
            {children}
        </group>
    )
}
