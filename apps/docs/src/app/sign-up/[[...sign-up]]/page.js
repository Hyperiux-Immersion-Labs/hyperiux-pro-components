import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { createPageMetadata } from "@/lib/seo-metadata";
import Navbar from "@/components/WebsiteComps/Navbar";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";

export const metadata = createPageMetadata({
  title: "Sign Up | Hyperiux Vault",
  description: "Create your Hyperiux Vault account to access pro effects and resources.",
  path: "/sign-up",
});

export default function SignUpPage() {
  return (
    <>
      <Navbar />
      <NavbarMobile />

      <AuthShell>
        <div className="hyperiux-clerk mx-auto w-[40vw] max-md:w-[90vw] max-sm:w-full">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/effects"
            forceRedirectUrl="/effects"
          />
        </div>
      </AuthShell>
    </>
  );
}
