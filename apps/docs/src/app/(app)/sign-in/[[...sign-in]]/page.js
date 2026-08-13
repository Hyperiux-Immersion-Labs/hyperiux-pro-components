import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { createPageMetadata } from "@/lib/seo-metadata";
import Navbar from "@/components/WebsiteComps/Navbar";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";
import { getSearchIndexEffects } from "@/lib/search-index";

export const metadata = createPageMetadata({
  title: "Sign In | Hyperiux Vault",
  description: "Sign in to Hyperiux Vault to access saved effects, dashboards, and pro resources.",
  path: "/sign-in",
  image: "/seo/homepage.png",
  robots: {
    index: false,
    follow: false,
  },
});

export default async function SignInPage() {
  const effects = await getSearchIndexEffects();

  return (
    <>
    <Navbar effects={effects}/>
    <NavbarMobile/>
    
    <AuthShell>
     <div className="hyperiux-clerk mx-auto w-[40vw] max-[1025px]:w-[90vw] max-md:w-full">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/effects"
          forceRedirectUrl="/effects"
          localization={{
            formButtonPrimary: "Continue to Vault",
            formFieldLabel__emailAddress: "Email",
            formFieldInputPlaceholder__emailAddress: "you@example.com",
            signIn: {
              start: {
                title: "Back to the Vault.",
                subtitle:
                  "Sign in to access your effects, Pro downloads, and CLI authentication.",
                actionText: "New here?",
                actionLink: "Create an account →",
              },
            },
          }}
        />

        {/* <p className="mt-6 text-center text-xs text-white/40">
          Your code stays in your repo. As it should.
        </p> */}
      </div>
    </AuthShell>
    </>
  );
}
