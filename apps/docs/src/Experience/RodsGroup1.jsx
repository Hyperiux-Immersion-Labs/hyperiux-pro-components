import { Environment, RoundedBox, MeshReflectorMaterial } from '@react-three/drei'
import React from 'react'


export default function RodsGroup1({ ctr }) {

    // Rod values, static, previously set via leva
    const rod1 = { posX: 0, posY: 3.1, posZ: 0.1, rotX: 39, rotY: -5, rotZ: 1 };
    const rod2 = { posX: -5, posY: 3.48, posZ: -4.5, rotX: -90, rotY: -4, rotZ: -10 };
    return (
        <group rotation={[0, 0, ctr(-8)]} position={[0, -.5, 0]}>
            {/* Rod 1: Top-Left to Bottom-Right (origin at center), now uses RoundedBox */}
            <RoundedBox
                position={[rod1.posX, rod1.posY, rod1.posZ]}
                rotation={[ctr(rod1.rotX), ctr(rod1.rotY), ctr(rod1.rotZ)]}
                args={[35, 0.35, 0.35]}
                radius={0.1}
                smoothness={8}
            >
                <MeshReflectorMaterial
                    color="#ffffff"
                    metalness={1.0}
                    roughness={0.03}
                    clearcoat={1.0}
                    blur={[0, 0]}
                    mirror={0.5}
                    mixStrength={1}

                />
            </RoundedBox>
            {/* Rod 2: Middle-Left to Bottom-Right (flatter slope, origin at center), now uses RoundedBox */}
            <RoundedBox
                position={[rod2.posX, rod2.posY, rod2.posZ]}
                rotation={[ctr(rod2.rotX), ctr(rod2.rotY), ctr(rod2.rotZ)]}
                args={[35, 0.4, 0.4]}
                radius={0.1}
                smoothness={8}
            >
                <MeshReflectorMaterial
                    color="#ffffff"
                    metalness={1.0}
                    roughness={0.03}
                    clearcoat={1.0}
                    blur={[0, 0]}
                    mirror={0.5}
                    mixStrength={1}

                />
            </RoundedBox>
        </group>
    )
}
