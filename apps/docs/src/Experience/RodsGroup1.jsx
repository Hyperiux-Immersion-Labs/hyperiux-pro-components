import React, { useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function RodsGroup1({ ctr, commonProps }) {
    const rod1Ref = useRef()
    const rod2Ref = useRef()

    // Rod values, static
    const rod1 = { posX: 0, posY: 3.1, posZ: 0.1, rotX: 39, rotY: -5, rotZ: 1 };
    const rod2 = { posX: -5, posY: 3.5, posZ: -4.5, rotX: -90, rotY: -4, rotZ: -10 };

    // Rolling animation on local longitudinal X axis
    useFrame((state, delta) => {
        if (rod1Ref.current) rod1Ref.current.rotation.x += delta * 0.2;
        if (rod2Ref.current) rod2Ref.current.rotation.x -= delta * 0.15;
    });

    return (
        <group rotation={[0, 0, ctr(-25)]} position={[0, -3, 0]}>
            {/* Rod 1 */}
            <group
                position={[rod1.posX, rod1.posY, rod1.posZ]}
                rotation={[ctr(rod1.rotX), ctr(rod1.rotY), ctr(rod1.rotZ)]}
            >
                <RoundedBox
                    ref={rod1Ref}
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    args={[35, 0.25, 0.25]}
                    radius={commonProps.radius}
                    smoothness={commonProps.smoothness}
                >
                    <meshPhysicalMaterial {...commonProps.materialProps} />
                </RoundedBox>
            </group>

            {/* Rod 2 */}
            <group
                position={[rod2.posX, rod2.posY, rod2.posZ]}
                rotation={[ctr(rod2.rotX), ctr(rod2.rotY), ctr(rod2.rotZ)]}
            >
                <RoundedBox
                    ref={rod2Ref}
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    args={[35, 0.3, 0.3]}
                    radius={commonProps.radius}
                    smoothness={commonProps.smoothness}
                >
                    <meshPhysicalMaterial {...commonProps.materialProps} />
                </RoundedBox>
            </group>
        </group>
    )
}
