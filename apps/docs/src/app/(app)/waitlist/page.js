import { Waitlist } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { createPageMetadata } from "@/lib/seo-metadata";
import Navbar from "@/components/WebsiteComps/Navbar";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";

export const metadata = createPageMetadata({
  title: "Join the Waitlist | Hyperiux Vault",
  description: "Join the Hyperiux Vault waitlist for early access to Pro.",
  path: "/waitlist",
  image: "/seo/homepage.png",
  robots: {
    index: false,
    follow: false,
  },
});

export default function WaitlistPage() {
  return (
    <>
      <Navbar />
      <NavbarMobile />

      <AuthShell>
        <div className="hyperiux-clerk mx-auto w-[40vw] max-md:w-[90vw] max-sm:w-full">
          <Waitlist signInUrl="/sign-in" />
        </div>
      </AuthShell>
    </>
  );
}
