'use client'

import { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'

export default function AnimatedLink({ href, children, className = '' }) {
    const underlineRef = useRef(null)
    const isAnimating = useRef(false)

    const handleMouseEnter = () => {
        if (isAnimating.current) return
        isAnimating.current = true
        const el = underlineRef.current
        if (!el) return
        gsap.timeline({
            onComplete: () => {
                isAnimating.current = false
            },
        })
            .to(el, {
                scaleX: 0,
                transformOrigin: 'right center',
                duration: 0.3,
                ease: 'power2.in',
            })
            .to(el, {
                scaleX: 1,
                transformOrigin: 'left center',
                duration: 0.3,
                ease: 'power2.out',
            })
    }

    return (
        <Link
            href={href}
            className={`relative w-fit inline-block text-black group ${className}`}
            onMouseEnter={handleMouseEnter}
        >
            <div className="flex items-center gap-[.5vw] w-fit cursor-pointer">
                <span className="relative overflow-hidden inline-flex h-[1.3em]">
                    <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                        {children}
                    </span>
                    <span className="inline-block absolute left-0 top-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                        {children}
                    </span>
                </span>

                <svg
                    className="transition-transform duration-300 group-hover:translate-y-0.75 size-2"
                    width="10"
                    height="13"
                    viewBox="0 0 10 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M8.24036 7.72066C8.30902 7.64697 8.39182 7.58787 8.48382 7.54688C8.57582 7.50589 8.67513 7.48384 8.77583 7.48207C8.87654 7.48029 8.97656 7.49882 9.06995 7.53654C9.16334 7.57426 9.24817 7.6304 9.31939 7.70162C9.39061 7.77284 9.44676 7.85767 9.48448 7.95106C9.5222 8.04445 9.54072 8.14448 9.53895 8.24518C9.53717 8.34588 9.51513 8.4452 9.47414 8.5372C9.43314 8.6292 9.37404 8.712 9.30035 8.78066L5.30035 12.7807C5.15973 12.9211 4.9691 13 4.77035 13C4.5716 13 4.38098 12.9211 4.24035 12.7807L0.240354 8.78066C0.166667 8.712 0.107565 8.6292 0.0665735 8.5372C0.0255818 8.4452 0.00354045 8.34588 0.00176376 8.24518C-1.2927e-05 8.14448 0.0185113 8.04445 0.0562319 7.95106C0.0939526 7.85767 0.150098 7.77284 0.221317 7.70162C0.292535 7.6304 0.377369 7.57426 0.470758 7.53654C0.564147 7.49882 0.664174 7.48029 0.764877 7.48207C0.86558 7.48384 0.964894 7.50589 1.05689 7.54688C1.14889 7.58787 1.23169 7.64697 1.30035 7.72066L4.02035 10.4407L4.02036 0.750659C4.02036 0.551747 4.09937 0.360981 4.24003 0.220329C4.38068 0.0796762 4.57144 0.000659508 4.77036 0.000659526C4.96927 0.000659543 5.16003 0.0796762 5.30069 0.220329C5.44134 0.360982 5.52036 0.551747 5.52036 0.75066L5.52035 10.4407L8.24036 7.72066Z"
                        fill="black"
                    />
                </svg>
            </div>
            <div
                ref={underlineRef}
                className="absolute left-0 -bottom-0.5 w-full h-px bg-black"
            />
        </Link>
    )
}
