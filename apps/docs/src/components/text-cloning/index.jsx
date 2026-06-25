"use client"
import React, { useEffect, useRef, useState } from "react";

export function TextCloning() {
    const canvasRef = useRef(null);
    const [text, setText] = useState("Hyperiux");

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let w, h, dpr;
        let raf;

        let mouse = { x: 0, y: 0 };
        let target = { x: 0, y: 0 };

        const lerp = (a, b, t) => a + (b - a) * t;

        const resize = () => {
            dpr = window.devicePixelRatio || 1;
            w = window.innerWidth;
            h = window.innerHeight;

            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            mouse.x = target.x = w / 2;
            mouse.y = target.y = h / 2;
        };

        const drawText = (value, x, y, size, alpha) => {
            ctx.font = `900 ${size}px Arial Black, Impact, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineWidth = 2;
            ctx.strokeStyle = `rgba(245,245,245,${alpha})`;
            ctx.strokeText(value, x, y);
        };

        const drawClones = () => {
            const dx = (mouse.x - w / 2) / w;
            const dy = (mouse.y - h / 2) / h;

            const depthX = dx * 220;
            const depthY = dy * 220;

            const layers = 9;
            const size = Math.min(w / Math.max(text.length * 0.72, 3), h * 0.42);

            for (let i = layers; i >= 0; i--) {
                const p = i / layers;

                drawText(
                    text,
                    w / 2 - depthX * p,
                    h / 2 - depthY * p,
                    size * (1 - p * 0.12),
                    0.16 + (1 - p) * 0.78
                );
            }
        };

        const drawStars = () => {
            for (let i = 0; i < 100; i++) {
                const x = (i * 91.7) % w;
                const y = (i * 47.3) % h;

                ctx.beginPath();
                ctx.fillStyle = "rgba(255,255,255,0.28)";
                ctx.arc(x, y, 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const render = () => {
            mouse.x = lerp(mouse.x, target.x, 0.08);
            mouse.y = lerp(mouse.y, target.y, 0.08);

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "#101010";
            ctx.fillRect(0, 0, w, h);

            drawStars();
            drawClones();

            raf = requestAnimationFrame(render);
        };

        const onMove = (e) => {
            target.x = e.clientX;
            target.y = e.clientY;
        };

        const onTouch = (e) => {
            const touch = e.touches?.[0];
            if (!touch) return;
            target.x = touch.clientX;
            target.y = touch.clientY;
        };

        resize();
        render();

        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerdown", onMove);
        window.addEventListener("touchstart", onTouch, { passive: true });
        window.addEventListener("touchmove", onTouch, { passive: true });

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onMove);
            window.removeEventListener("touchstart", onTouch);
            window.removeEventListener("touchmove", onTouch);
        };
    }, [text]);

    return (
        <>
            <input
                value={text}
                onChange={(e) => setText(e.target.value || "")}
                placeholder="Type text"
               className="w-fit px-[2vw] py-[1vw] rounded-full border border-white/20 fixed bottom-[5%] z-10 left-1/2 -translate-x-1/2 focus:border-[#ff5f00] focus:outline-[#ff5f00] max-md:px-[5vw] max-sm:py-[3vw] max-md:py-[2vw] max-md:text-[3vw]! max-sm:text-[4vw]! text-center"
            />


            <canvas
                ref={canvasRef}
                style={{
                    position: "fixed",
                    inset: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "#101010",
                    display: "block",
                }}
            />
        </>
    );
}
