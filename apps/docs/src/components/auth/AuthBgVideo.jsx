"use client";

import { useEffect, useRef } from "react";

// The src is assigned in useEffect instead of JSX on purpose. During route
// transitions React can build and discard this tree many times before
// committing; a <video src> in render spawns a WebMediaPlayer per attempt,
// piling into Chrome's ~75-player cap and flooding the console with
// "Blocked attempt to create a WebMediaPlayer" (crbug.com/1144736).
// Effects only run on committed trees, so this creates exactly one player.
export default function AuthBgVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = "/assets/videos/bg-video.mp4";
    video.play().catch(() => {});

    return () => {
      // Release the WebMediaPlayer eagerly; GC alone is too lazy.
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}
