import { cookies } from "next/headers";
import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { createPageMetadata } from "@/lib/seo-metadata";
import Navbar from "@/components/WebsiteComps/Navbar";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";
import { getSearchIndexEffects } from "@/lib/search-index";

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

export default async function SignUpContinuePage() {
  const effects = await getSearchIndexEffects();

  // If this browser followed a partner referral link, the tracker
  // (components/WebsiteComps/AffitorTracking.jsx) already set this cookie on
  // an earlier request, so it's readable here server-side. Threading it
  // through as unsafeMetadata is what lets the user.created webhook bind
  // this signup to that partner via trackAffitorLead() - same mechanism
  // SignUpFlow.jsx's custom flow uses, just read server-side here since
  // this widget has no client completion hook to read the cookie from.
  const cookieStore = await cookies();
  const affitorClickId = cookieStore.get("affitor_click_id")?.value;

  return (
    <>
      <Navbar effects={effects} />
      <NavbarMobile />

      <AuthShell>
        <div className="hyperiux-clerk mx-auto w-[40vw] max-[1025px]:w-[90vw] max-md:w-full">
          <SignUp
            path="/signup/continue"
            routing="path"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/effects"
            {...(affitorClickId && {
              unsafeMetadata: { affitor_click_id: affitorClickId },
            })}
          />
        </div>
      </AuthShell>
    </>
  );
}
