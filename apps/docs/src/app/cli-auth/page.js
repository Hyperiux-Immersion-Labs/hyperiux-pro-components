import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/subscription";
import { CliAuthClient } from "./cli-auth-client";
import { createPageMetadata } from "@/lib/seo-metadata";

export const metadata = createPageMetadata({
  title: "CLI Token | Hyperiux Pro",
  description: "Generate your Hyperiux CLI token to install pro effects.",
  path: "/cli-auth",
  image: "/seo/homepage.png",
});

export default async function CliAuthPage() {
  const { userId } = await auth();

  // Redirect unauthenticated users to sign-in, returning here after
  if (!userId) {
    redirect("/sign-in?redirect_url=/cli-auth");
  }

  const plan = await getUserPlan(userId);
  const isPro = plan === "pro";

  return <CliAuthClient isPro={isPro} />;
}
