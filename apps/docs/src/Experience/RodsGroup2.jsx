import { Environment, RoundedBox, MeshReflectorMaterial } from '@react-three/drei'
import React from 'react'


export default function RodsGroup2({ ctr }) {

    // Rod values, static, previously set via leva
    const rod1 = { posX: -2, posY: -1.2, posZ: -1.6, rotX: -0, rotY: -4, rotZ: -10 };
    const rod2 = { posX: -2.5, posY: -.5, posZ: -2, rotX: 0, rotY: 0, rotZ: -30 };
    const rod3 = { posX: -2.5, posY: -1.4, posZ: -2, rotX: 0, rotY: 0, rotZ: -25 };
    return (
        <group scale={0.9} rotation={[0, 0, ctr(-12)]} position={[-1.9, -2.7, 0]}>
            {/* Rod 1: Top-Left to Bottom-Right (origin at center), now uses RoundedBox */}
            <RoundedBox
                position={[rod1.posX, rod1.posY, rod1.posZ]}
                rotation={[ctr(rod1.rotX), ctr(rod1.rotY), ctr(rod1.rotZ)]}
                args={[15, 0.35, 0.35]}
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
                args={[15, 0.4, 0.4]}
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
            <RoundedBox
                position={[rod3.posX, rod3.posY, rod3.posZ]}
                rotation={[ctr(rod3.rotX), ctr(rod3.rotY), ctr(rod3.rotZ)]}
                args={[15, 0.4, 0.4]}
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
