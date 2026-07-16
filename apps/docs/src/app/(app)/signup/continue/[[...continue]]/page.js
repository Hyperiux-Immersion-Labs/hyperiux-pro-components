import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { createPageMetadata } from "@/lib/seo-metadata";
import Navbar from "@/components/WebsiteComps/Navbar";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";

export const metadata = createPageMetadata({
  title: "Continue Sign Up | Hyperiux Vault",
  description: "Finish setting up your Hyperiux Vault account.",
  path: "/signup/continue",
  image: "/seo/homepage.png",
  robots: {
    index: false,
    follow: false,
  },
});

export default function SignUpContinuePage() {
  return (
    <>
      <Navbar />
      <NavbarMobile />

      <AuthShell>
        <div className="hyperiux-clerk mx-auto w-[40vw] max-md:w-[90vw] max-sm:w-full">
          <SignUp
            path="/signup/continue"
            routing="path"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/pricing"
          />
        </div>
      </AuthShell>
    </>
  );
}
