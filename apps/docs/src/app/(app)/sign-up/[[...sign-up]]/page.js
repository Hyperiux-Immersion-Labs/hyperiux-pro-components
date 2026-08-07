import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { createPageMetadata } from "@/lib/seo-metadata";
import Navbar from "@/components/WebsiteComps/Navbar";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";
import { getSearchIndexEffects } from "@/lib/search-index";

export const metadata = createPageMetadata({
  title: "Sign Up | Hyperiux Vault",
  description: "Create your Hyperiux Vault account to access pro effects and resources.",
  path: "/sign-up",
  image: "/seo/homepage.png",
  robots: {
    index: false,
    follow: false,
  },
});

export default async function SignUpPage() {
  const effects = await getSearchIndexEffects();

  return (
    <>
      <Navbar effects={effects} />
      <NavbarMobile />

      <AuthShell>
        <div className="hyperiux-clerk mx-auto w-[40vw] max-[1025px]:w-[90vw] max-md:w-full">
         
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/pricing#pricing-cards"
          />
        </div>
      </AuthShell>
    </>
  );
}
