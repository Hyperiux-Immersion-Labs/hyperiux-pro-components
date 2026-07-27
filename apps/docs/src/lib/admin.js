import "server-only";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

// No hardcoded fallback: if ADMIN_EMAIL is unset, email-based admin access
// is simply unavailable - only publicMetadata.role === "admin" still works.
// Fails closed instead of granting a literal hardcoded account admin access
// whenever the env var happens to be missing.
export function isAdminUser(user) {
  if (!user) return false;

  if (user.publicMetadata?.role === "admin") return true;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  return user.emailAddresses?.[0]?.emailAddress === adminEmail;
}

// For server components that already have a Clerk `user` via currentUser().
export async function requireAdmin() {
  const user = await currentUser();
  return isAdminUser(user);
}

// For API routes using auth() + clerkClient().
export async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) return false;

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  return isAdminUser(user);
}
