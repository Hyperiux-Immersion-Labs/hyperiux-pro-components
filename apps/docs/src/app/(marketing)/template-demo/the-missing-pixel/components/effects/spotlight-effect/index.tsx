// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";

type SpotlightEffectProps = {
  image: StaticImageData;
  litImage: StaticImageData;
  alt: string;
  sizes?: string;
  className?: string;
  children?: ReactNode;
  body?: ReactNode;
};

const SpotlightEffect = ({ image, litImage, alt, sizes, className = "", children, body }: SpotlightEffectProps) => {
  const mediaRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const media = mediaRef.current;
    if (!media) return;
    const rect = media.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    media.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    media.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };

  const imageClasses =
    "absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-[scale,opacity] duration-[1400ms] ease-[cubic-bezier(0.25,1,0.5,1)] scale-[1.001] group-hover:scale-110 motion-reduce:transition-opacity motion-reduce:duration-[300ms] motion-reduce:group-hover:scale-[1.001]";

  return (
    <div
      onPointerMove={handleMove}
      className={`group flex flex-col rounded-lg bg-mpx-ink p-2 text-mpx-paper ${className}`.trim()}
    >
      <div ref={mediaRef} className="relative isolate aspect-[6/7] overflow-hidden rounded-md bg-(--mpx-accent)">
        <Image src={image} alt={alt} sizes={sizes} quality={95} className={imageClasses} />
        <Image
          src={litImage}
          alt=""
          aria-hidden
          sizes={sizes}
          quality={95}
          className={`${imageClasses} opacity-0 group-hover:opacity-100`}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,35%),rgb(255_95_0/0.75),transparent_48%)] opacity-0 mix-blend-soft-light transition-opacity duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[55%] bottom-0 z-1 bg-linear-to-b from-transparent to-[rgb(10_10_10/0.55)] transition-opacity duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-40"
        />
        {children}
      </div>
      {body}
    </div>
  );
};

export default SpotlightEffect;
