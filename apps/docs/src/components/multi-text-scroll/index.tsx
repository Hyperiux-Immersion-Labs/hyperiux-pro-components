import React from 'react'

const TEXT = "DESIGN";
const ITEM_COUNT = 10;
const ROTATE_STEP_DEG =15;

const MultiTextScroll = () => {
  return (
    <>
    <div className="w-screen h-screen flex justify-center items-center bg-[#FFBF00] text-[#111111] ">
      <div className="w-[40%] h-full absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center" style={{ perspective: "800px" }}>
        {/* transformStyle: preserve-3d keeps every line's independent
            rotateY below in the same 3D space instead of each one flattening
            onto this wrapper's own plane. */}
        <div className="flex flex-col items-center" style={{ transformStyle: "preserve-3d" }}>
          {Array.from({ length: ITEM_COUNT }).map((_, i) => {
            // Centered on the midpoint between item 4 and 5 (10 is even, so
            // there's no single dead-center line) - each line differs from
            // its neighbor by exactly 5deg either side, so lines above tilt
            // one way and lines below tilt the other, reading as one
            // continuous twist rather than a jump - the DNA/spiral look.
            const rotateY = (i - (ITEM_COUNT - 1) / 2) * ROTATE_STEP_DEG;

            return (
              <p
                key={i}
                className="text-[3vw] font-semibold text-center"
                style={{ transform: `rotateY(${rotateY}deg)` }}
              >
                {TEXT}
              </p>
            );
          })}
        </div>
      </div>
    </div>
    </>
  )
}

export default MultiTextScroll