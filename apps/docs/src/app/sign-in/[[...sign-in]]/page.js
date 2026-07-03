import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { createPageMetadata } from "@/lib/seo-metadata";
import Navbar from "@/components/WebsiteComps/Navbar";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";

export const metadata = createPageMetadata({
  title: "Sign In | Hyperiux Vault",
  description: "Sign in to Hyperiux Vault to access saved effects, dashboards, and pro resources.",
  path: "/sign-in",
  image: "/seo/homepage.png",
});

export default function SignInPage() {
  return (
    <>
    <Navbar/>
    <NavbarMobile/>
    
    <AuthShell>
     <div className="hyperiux-clerk mx-auto w-[40vw] max-md:w-[90vw] max-sm:w-full">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/effects"
          forceRedirectUrl="/effects"
        />
      </div>
    </AuthShell>
    </>
  );
}
