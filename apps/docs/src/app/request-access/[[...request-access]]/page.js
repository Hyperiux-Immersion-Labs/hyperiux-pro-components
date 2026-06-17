import AuthShell from "@/components/auth/AuthShell";
import AccessRequestForm from "@/components/auth/AccessRequestForm";
import Navbar from "@/components/WebsiteComps/Navbar";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";

export const metadata = {
  title: "Request Access | Hyperiux Vault",
};

export default function SignUpPage() {
  return (
    <AuthShell>
      <Navbar />
      <NavbarMobile />
      <AccessRequestForm />
    </AuthShell>
  );
}
