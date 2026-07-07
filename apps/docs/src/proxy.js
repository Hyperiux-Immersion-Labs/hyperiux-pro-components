import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/dashboard(.*)",
  "/api/wishlist(.*)",
  // Not /api/stripe/webhooks — Stripe's server sends these with no Clerk
  // session. auth.protect() 404s unauthenticated non-browser requests, which
  // silently dropped every webhook delivery (Stripe emailed about 24 failed
  // attempts). The route already authenticates via the stripe-signature
  // header, so it must never sit behind Clerk's auth wall.
  "/api/stripe/checkout(.*)",
  "/api/stripe/portal(.*)",
  "/api/stripe/sync-session(.*)",
]);

const withClerk = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

// Strip stale __client_uat cookies before Clerk processes the request.
// When the site ran with dev Clerk keys, browsers received a __client_uat
// cookie issued by the dev instance. After switching to production keys,
// Clerk middleware sees that UAT, can't match it to the production instance,
// and injects a cross-instance handshake into the RSC payload — redirecting
// even non-authenticated visitors to adequate-shad-61.clerk.accounts.dev.
// Removing the orphaned UAT from the request before Clerk runs prevents this.
export default async function middleware(request) {
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = new URL(request.url);
    url.host = host.replace(/^www\./, "");
    return NextResponse.redirect(url.toString(), 301);
  }

  const clientUat = request.cookies.get("__client_uat")?.value;
  const session = request.cookies.get("__session")?.value;

  if (clientUat && clientUat !== "0" && !session) {
    const newHeaders = new Headers(request.headers);
    const cleaned = (newHeaders.get("cookie") || "")
      .split(";")
      .map((c) => c.trim())
      .filter((c) => !c.startsWith("__client_uat="))
      .join("; ");
    cleaned
      ? newHeaders.set("cookie", cleaned)
      : newHeaders.delete("cookie");

    const cleanRequest = new NextRequest(request.url, {
      method: request.method,
      headers: newHeaders,
    });

    const response = await withClerk(cleanRequest);
    // Also tell the browser to zero out the stale cookie
    const res = response ?? NextResponse.next();
    res.cookies.set("__client_uat", "0", {
      path: "/",
      maxAge: 0,
      secure: true,
      sameSite: "strict",
    });
    return res;
  }

  return withClerk(request);
}

export const config = {
  matcher: [
    // Skip all internal paths and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
