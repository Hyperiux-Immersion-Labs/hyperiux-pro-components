import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">404</p>
        <h1 className="mt-4 text-4xl font-medium">Page not found</h1>
        <p className="mt-4 text-base text-foreground/70">
          The page you requested does not exist or may have moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-foreground/15 px-5 py-3 text-sm transition hover:border-foreground/30 hover:text-foreground/80"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
