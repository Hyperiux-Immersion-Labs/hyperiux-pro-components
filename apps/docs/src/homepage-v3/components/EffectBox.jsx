"use client";

import Image from "next/image";
import Link from "next/link";

const ArrowUpRight = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full h-full ${className}`}
    aria-hidden
  >
    <path
      d="M8 16L16 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 8H16V14.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function EffectBox({
  title,
  tag,
  href = "#",
  media,
  video = false,
  poster,
  action = "View Effect",
  aspect = "aspect-[3/2]",
  className = "",
  mediaClassName = "",
  priority = false,
}) {
  const mark =
    "pointer-events-none absolute size-[0.3vw] border-grey  transition-all duration-300 group-hover:border-primary  max-md:size-2 max-sm:size-1.5";

  return (
    <Link
      prefetch={false}
      href={href}
      aria-label={`${title}${tag ? ` — ${tag}` : ""}`}
      className={`group block w-full text-white ${className}`}
    >
      <div
        className={`relative w-full overflow-hidden bg-[#0e0e0e] ${aspect} ${mediaClassName}`}
      >
        {media ? (
          video ? (
            <video
              src={media}
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <Image
              src={media}
              alt={title}
              fill
              sizes="(max-width: 768px) 92vw, (max-width: 1025px) 44vw, 26vw"
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          )
        ) : (
          <span className="absolute inset-0 bg-[linear-gradient(135deg,#1a1a1a,#0e0e0e)]" />
        )}

        {tag ? (
          <span className="absolute left-[0.7vw] top-[0.7vw] bg-grey px-[0.55vw] py-[0.45vw] font-geist-mono text-[0.72vw] leading-none tracking-wide text-white backdrop-blur-sm max-md:left-2 max-md:top-2 max-md:px-2 max-md:py-1 max-md:text-[1.5vw] max-sm:text-[2.6vw]">
            {tag}
          </span>
        ) : null}
      </div>

      <div className="relative flex items-end justify-between gap-[1vw] py-[1vw] px-[1vw] mt-[1vw]">
        <span className={`${mark} -top-px -left-px border-t border-l`} />
        <span className={`${mark} -top-px -right-px border-t border-r`} />
        <span className={`${mark} -bottom-px -left-px border-b border-l`} />
        <span className={`${mark} -bottom-px -right-px border-b border-r`} />

        <p className="t22 font-neue-haas leading-none text-white max-md:text-[2.4vw] max-sm:text-[4vw]">
          {title}
        </p>

        <span className="flex items-center gap-[0.35vw] text18 leading-none text-light-grey transition-colors duration-500 group-hover:text-white motion-reduce:transition-none max-md:gap-1 max-md:text-[1.7vw] max-sm:text-[3vw]">
          {action}
          <span className="inline-block size-[1.8vw]">
            <ArrowUpRight />
          </span>
        </span>
      </div>
    </Link>
  );
}
