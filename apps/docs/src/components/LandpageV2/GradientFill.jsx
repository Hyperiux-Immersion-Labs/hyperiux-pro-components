'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { SplitText } from 'gsap/dist/SplitText'

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText)
}

export default function GradientFill() {
    const containerRef = useRef(null)
    const textRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        let split;

        // Canvas setup
        const canvas = canvasRef.current;
        const ctx2d = canvas.getContext("2d");
        let w = window.innerWidth;
        let h = window.innerHeight;

        // This object holds the progress of our fill (0 to 1)
        const animState = { progress: 0 };

        const setCanvasSize = () => {
            // Make the canvas taller than the screen (150vh) so it bleeds out cleanly
            w = window.innerWidth;
            h = window.innerHeight * 1.5;
            canvas.width = w;
            canvas.height = h;
            draw(); // Redraw instantly on resize
        };
        window.addEventListener('resize', setCanvasSize);
        setCanvasSize();

        function draw() {
            if (!ctx2d) return;
            // Clear without filter
            ctx2d.filter = 'none';
            ctx2d.clearRect(0, 0, w, h);

            if (animState.progress === 0) return;

            // Canvas is 150vh tall. The visible screen starts 25vh down from the top of the canvas.
            const screenTopY = h / 6;

            // Sweep from safely below the screen UP to safely above the screen
            const startY = h + 200;
            const endY = screenTopY - 200;
            const sweepDistance = startY - endY;

            // At progress=0, currentY = bottom. At progress=1, currentY = top.
            const currentY = startY - (sweepDistance * animState.progress);

            // Curve intensity peaks at 50% fill (progress = 0.5) and flattens out at 100%
            const intensity = Math.sin(animState.progress * Math.PI);
            // Concave dip for a bottom-to-top fill: edges are higher than the center,
            // so the center cpY is LOWER (larger Y) than currentY
            const cpY = currentY + (400 * intensity);

            // Create a super smooth radial gradient from the TOP center of the screen
            const maxRadius = Math.max(w, h) * 0.8;
            const grad = ctx2d.createRadialGradient(w / 2, screenTopY, 0, w / 2, screenTopY, maxRadius);

            // Brightest at the top center (Primary color)
            grad.addColorStop(0, '#ff5f00');
            // Smooth falloff in the middle
            grad.addColorStop(0.5, 'rgba(255, 95, 0, 0.4)');
            // Fades perfectly into the dark background at the edges/bottom
            grad.addColorStop(1, 'transparent');

            // Apply a massive blur to make the hard bezier curve look like an incredibly soft gradient!
            ctx2d.filter = 'blur(200px)';

            ctx2d.fillStyle = grad;
            ctx2d.beginPath();
            // Start from the bottom-left, go up to the left edge of the curve (extended out for larger blur)
            ctx2d.moveTo(-400, h + 400);
            ctx2d.lineTo(-400, currentY);
            // Draw a concave bezier curve to the right edge
            ctx2d.quadraticCurveTo(w / 2, cpY, w + 400, currentY);
            // Go down to bottom-right
            ctx2d.lineTo(w + 400, h + 400);
            ctx2d.closePath();
            ctx2d.fill();
        }

        const ctx = gsap.context(() => {
            split = new SplitText(textRef.current, { type: 'lines' })

            gsap.set(textRef.current, { perspective: 2000 })
            gsap.set(split.lines, { willChange: 'transform, opacity', transformOrigin: '50% 50%' })
            gsap.set(canvas, { willChange: 'transform' }) // For the exit slide

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "-20% top",
                    end: "bottom bottom",
                    scrub: 1.5, // Add 1.5 seconds of smoothing to the scroll catch-up!
                }
            })

            // 1. Text enters swinging down & Canvas draws the concave fill upwards
            tl.fromTo(split.lines,
                { rotationX: -15, yPercent: 100, opacity: 0 },
                { rotationX: 0, yPercent: 0, opacity: 1, stagger: 0.2, duration: 1, ease: 'none' },
                0
            )


            // 2. Text holds & Canvas holds (fully filled and flattened)
            tl.to({}, { duration: 1 }, 1)

            // 3. Text swings up and out (Canvas stays fully filled!)
            tl.to(split.lines,
                { rotationX: 15, yPercent: -100, opacity: 0, stagger: 0.2, duration: 1, ease: 'none' },
                2
            )
            gsap.to(animState, {
                progress: 1,
                duration: 1,
                ease: 'none',
                onUpdate: draw,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "-20% top",
                    end: "bottom bottom",
                    scrub: 1.5, // Add 1.5 seconds of smoothing to the scroll catch-up!
                }
            }, 0)

        }, containerRef)

        return () => {
            if (split) split.revert();
            ctx.revert();
            window.removeEventListener('resize', setCanvasSize);
        }
    }, [])

    return (
        <section ref={containerRef} className='h-[200vh] relative w-full'>
            <div className='w-full sticky top-0 z-99 h-screen flex justify-center items-center'>

                {/* Oversized Canvas 2D background fill with CSS mask to completely eliminate hard edges */}
                <canvas
                    ref={canvasRef}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150vh] pointer-events-none z-0'
                    style={{
                        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
                    }}
                />

                <p ref={textRef} className='text64 relative z-99 w-[72vw] mx-auto text-center pointer-events-none'>
                    Most websites are not broken. They are forgettable. They use the same sections, the same rhythm, the same static patterns, and the same safe animations everyone else is using.
                </p>
            </div>
        </section>
    )
}
