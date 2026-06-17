import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { createPageMetadata } from "@/lib/seo-metadata";

export const metadata = createPageMetadata({
  title: "Sign In | Hyperiux Vault",
  description: "Sign in to Hyperiux Vault to access saved effects, dashboards, and pro resources.",
  path: "/sign-in",
});

export default function SignInPage() {
  return (
    <AuthShell>
      <div className="hyperiux-clerk">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/effects"
          forceRedirectUrl="/effects"
        />
      </div>
    </AuthShell>
  );
}
