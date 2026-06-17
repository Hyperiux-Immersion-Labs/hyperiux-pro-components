import Link from "next/link";

export default function AuthShell({
  children,
  backHref = "/",
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-20 text-white">
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src={"/assets/videos/bg-video.mp4"}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />


      {/* <Link
        href={backHref}
        aria-label="Go back"
        className="fixed left-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-xl transition-all duration-300 hover:border-primary/60 hover:bg-primary hover:text-white max-sm:left-4 max-sm:top-4"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link> */}

      <div className="relative z-10 flex w-full items-center justify-center">
        {children}
      </div>
    </main>
  );
}