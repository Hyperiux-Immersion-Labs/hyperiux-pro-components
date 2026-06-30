import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hitesh@weareenigma.com";

export default async function AdminLayout({ children }) {
  const user = await currentUser();

  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL;

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
