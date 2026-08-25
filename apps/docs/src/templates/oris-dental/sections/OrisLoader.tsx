'use client'

import React, { useState, useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import Image from 'next/image'

export default function OrisLoader({ onComplete }: { onComplete?: () => void }) {
    const { active, progress } = useProgress()
    const [displayProgress, setDisplayProgress] = useState(0)
    const [completed, setCompleted] = useState(false)
    const [visible, setVisible] = useState(true)

    // Smoothly step displayProgress towards actual progress (guarantees completion when loaded)
    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayProgress((prev) => {
                const target = Math.max(progress, !active ? 100 : 0)
                if (prev < target) {
                    const step = Math.ceil((target - prev) * 0.18) || 1
                    return Math.min(target, prev + step)
                }
                return prev
            })
        }, 20)
        return () => clearInterval(interval)
    }, [progress, active])

    useEffect(() => {
        if (displayProgress >= 100) {
            const timer = setTimeout(() => {
                setCompleted(true)
                if (typeof window !== 'undefined') {
                    ;(window as any).__orisLoaderFinished = true
                    window.dispatchEvent(new CustomEvent('oris-loader-finished'))
                }
                if (onComplete) onComplete()
                const removeTimer = setTimeout(() => setVisible(false), 750)
                return () => clearTimeout(removeTimer)
            }, 350)
            return () => clearTimeout(timer)
        }
    }, [displayProgress, onComplete])

    if (!visible) return null

    return (
        <aside
            aria-label="Loading"
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-[#3365e2] to-[#0f2b82] text-white transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${
                completed ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 pointer-events-auto'
            }`}
        >
            {/* Ambient soft glow */}
            <div className="absolute w-[20vw] h-[20vw] rounded-full bg-white/10 blur-3xl pointer-events-none" />

            {/* Clean Watermark Logo Fill */}
            <div className="relative z-10 flex flex-col items-center select-none px-6">
                <div className="relative w-[32vw] max-w-[360px] min-w-[220px] aspect-[1872/334]">
                    {/* Background faint watermark outline */}
                    <Image
                        src="/templates/oris-detal/OtisDentalwordmark.svg"
                        alt="OrisDental"
                        fill
                        className="object-contain opacity-20 pointer-events-none"
                        priority
                    />

                    {/* Foreground filled watermark animated by progress */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-all duration-150 ease-out"
                        style={{ clipPath: `inset(0 ${Math.max(0, 100 - displayProgress)}% 0 0)` }}
                    >
                        <Image
                            src="/templates/oris-detal/OtisDentalwordmark.svg"
                            alt="OrisDental"
                            fill
                            className="object-contain "
                            priority
                        />
                    </div>
                </div>

                {/* Minimal Progress Indicator */}
                {/* <div className="mt-8 flex flex-col items-center gap-2.5">
                    <span className="text-xs font-medium tracking-widest text-white/90 tabular-nums">
                        {Math.floor(displayProgress)}%
                    </span>
                    <div className="w-28 h-[2px] bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-150 ease-out rounded-full "
                            style={{ width: `${displayProgress}%` }}
                        />
                    </div>
                </div> */}
            </div>
        </aside>
    )
}
