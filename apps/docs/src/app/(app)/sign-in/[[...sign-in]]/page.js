import { createPageMetadata } from "@/lib/seo-metadata";
import SignInFlow from "@/components/auth/SignInFlow";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";
import NavbarV3 from "@/homepage-v3/components/NavbarV3";

export const metadata = createPageMetadata({
  title: "Sign In | Hyperiux Vault",
  description:
    "Sign in to Hyperiux Vault to access saved effects, dashboards, and pro resources.",
  path: "/sign-in",
  image: "/seo/homepage.png",
  robots: {
    index: false,
    follow: false,
  },
});

export default function SignInPage() {
  return (
    <>
      <NavbarV3 />
      <NavbarMobile />
      <SignInFlow />
    </>
  );
}
