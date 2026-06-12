import React, { useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function RodsGroup2({ ctr, commonProps }) {
    const rod1Ref = useRef()
    const rod2Ref = useRef()
    const rod3Ref = useRef()

    // Rod values, static
    const rod1 = { posX: -2, posY: -1.5, posZ: -1.6, rotX: -0, rotY: -4, rotZ: -12 };
    const rod2 = { posX: -2.5, posY: -.5, posZ: -2, rotX: 0, rotY: 0, rotZ: -30 };
    const rod3 = { posX: -2.5, posY: -1.4, posZ: -2, rotX: 0, rotY: 0, rotZ: -25 };

    // Rolling animation on local longitudinal X axis
    useFrame((state, delta) => {
        if (rod1Ref.current) rod1Ref.current.rotation.x += delta * 0.225;
        if (rod2Ref.current) rod2Ref.current.rotation.x -= delta * 0.225;
        if (rod3Ref.current) rod3Ref.current.rotation.x += delta * 0.125;
    });

    return (
        <group scale={0.9} rotation={[0, 0, ctr(-12)]} position={[-1.9, -2.7, 0]}>
            {/* Rod 1 */}
            <group
                position={[rod1.posX, rod1.posY, rod1.posZ]}
                rotation={[ctr(rod1.rotX), ctr(rod1.rotY), ctr(rod1.rotZ)]}
            >
                <RoundedBox
                    ref={rod1Ref}
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    args={[15, 0.3, 0.3]}
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
                    args={[15, 0.3, 0.3]}
                    radius={commonProps.radius}
                    smoothness={commonProps.smoothness}
                >
                    <meshPhysicalMaterial {...commonProps.materialProps} />
                </RoundedBox>
            </group>

            {/* Rod 3 */}
            <group
                position={[rod3.posX, rod3.posY, rod3.posZ]}
                rotation={[ctr(rod3.rotX), ctr(rod3.rotY), ctr(rod3.rotZ)]}
            >
                <RoundedBox
                    ref={rod3Ref}
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    args={[15, 0.25, 0.25]}
                    radius={commonProps.radius}
                    smoothness={commonProps.smoothness}
                >
                    <meshPhysicalMaterial {...commonProps.materialProps} />
                </RoundedBox>
            </group>
        </group>
    )
}
