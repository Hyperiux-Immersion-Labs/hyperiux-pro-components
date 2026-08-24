"use client";

import React from "react";

export function PixelSquaresLoader({ className = "" }) {
  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <span aria-hidden="true" className="grid grid-cols-2 gap-2">
        <style>{`
          @keyframes pixelGlitchInLoop {
            0%, 22%, 44% { opacity: 0; }
            11%, 33%, 55%, 100% { opacity: 1; }
          }
          @keyframes pixelGlitchFlashLoop {
            0%, 18%, 34%, 56%, 78%, 100% { opacity: 0; }
            9%, 26%, 45%, 67% { opacity: 1; }
          }
          .animate-glitch-square {
            animation: pixelGlitchInLoop 1.4s steps(1, end) infinite;
          }
          .animate-glitch-cell {
            animation: pixelGlitchFlashLoop 1.2s steps(1, end) infinite;
          }
        `}</style>
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * 160}ms` }}
            className="animate-glitch-square relative size-5 bg-primary shadow-lg"
          >
            <span
              style={{ animationDelay: `${i * 160}ms` }}
              className="animate-glitch-cell absolute inset-0 bg-white"
            />
          </span>
        ))}
      </span>
    </div>
  );
}

export default PixelSquaresLoader;
