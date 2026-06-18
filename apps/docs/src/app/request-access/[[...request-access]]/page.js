import AuthShell from "@/components/auth/AuthShell";
import AccessRequestForm from "@/components/auth/AccessRequestForm";
import Navbar from "@/components/WebsiteComps/Navbar";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";
import { createPageMetadata } from "@/lib/seo-metadata";

export const metadata = createPageMetadata({
  title: "Request Access | Hyperiux Vault",
  description: "Request access to Hyperiux Vault and start using modern UI effects and components.",
  path: "/request-access",
});

export default function SignUpPage() {
  return (
    <AuthShell>
      <Navbar />
      <NavbarMobile />
      <AccessRequestForm />
    </AuthShell>
  );
}
