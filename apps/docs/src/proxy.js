import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/dashboard(.*)",
  "/api/wishlist(.*)",
  "/api/stripe(.*)",
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
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    "/(api|trpc)(.*)",
  ],
};
