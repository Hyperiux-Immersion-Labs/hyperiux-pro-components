import AuthBgVideo from "./AuthBgVideo";

export default function AuthShell({
  children,
  backHref = "/",
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-20 text-white">
      <AuthBgVideo />


      {/* <Link
        href={backHref}
        aria-label="Go back"
        className="fixed left-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-xl transition-all duration-300 hover:border-primary/60 hover:bg-primary hover:text-white max-md:left-4 max-md:top-4"
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