'use client'
import { useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect, useRef } from "react";
import { Experience } from "./Experience";
import { UI } from "./UI";
import { PageProvider } from "./PageContext";

function useAssetsReady() {
    const { active } = useProgress();
    const [timerDone, setTimerDone] = useState(false);
    const [assetsDone, setAssetsDone] = useState(false);
    const hasBeenActive = useRef(false);

    useEffect(() => {
        const timer = setTimeout(() => setTimerDone(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (active) {
            hasBeenActive.current = true;
        } else if (hasBeenActive.current) {
            setAssetsDone(true);
        }
    }, [active]);

    return timerDone && (assetsDone || !hasBeenActive.current);
}

export const BookFlipp = ({ images = [],
    pathPattern = "/assets/nature",
    bgColor = "#000000",
    cameraDistance = { mobile: 9, desktop: 4 },
    floatConfig = {},
    showUI = true,
    ...props
}) => {
    const [cameraZ, setCameraZ] = useState(cameraDistance.mobile);
    const ready = useAssetsReady();

    const horizontalDistance = Math.hypot(0.5, cameraZ);
    const basePolarAngle = Math.atan2(horizontalDistance, 1);
    const orbitLimits = {
        minAzimuthAngle: -Math.PI * 0.06,
        maxAzimuthAngle: Math.PI * 0.06,
        minPolarAngle: basePolarAngle - Math.PI * 0.08,
        maxPolarAngle: basePolarAngle + Math.PI * 0.08,
        rotateSpeed: 0.2,
    };

    useEffect(() => {
        const handleResize = () => {
            setCameraZ(window.innerWidth > 800 ? cameraDistance.desktop : cameraDistance.mobile);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [cameraDistance]);

    return (
        <PageProvider>
            
            {showUI && <UI images={images} />}
            <div style={{
                width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0,
                backgroundColor: bgColor,
            }}>
                <Canvas camera={{
                    position: [-0.5, 1, cameraZ],
                    fov: 45,
                }}>
                    <group position-y={0}>
                        <Suspense fallback={null}>
                            <Experience
                                images={images}
                                pathPattern={pathPattern}
                                floatConfig={floatConfig}
                                orbitControls={orbitLimits}
                                {...props}
                            />
                        </Suspense>
                    </group>
                </Canvas>
            </div>

            {/* Single overlay that fades out once ready - one clean visual event */}
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: bgColor,
                opacity: ready ? 0 : 1,
                transition: 'opacity 0.8s ease',
                pointerEvents: ready ? 'none' : 'auto',
            }} />
        </PageProvider>
    );
};
