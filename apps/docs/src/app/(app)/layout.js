import { ClerkProvider } from "@clerk/nextjs";

// ClerkProvider lives here - NOT in the root layout - so marketing routes
// ((marketing) group: /, /docs, /legal, /tech, /demo, ...) ship zero Clerk
// scripts. Every route that needs auth context (dashboard, effects, sign-in,
// sign-up, pricing's plan-aware UI, cli-auth) lives under this group.
// Route groups don't change URLs.
// Clerk only reads `localization` off <ClerkProvider> - passing it directly
// to <SignIn>/<SignUp> is silently ignored (it's not in either component's
// prop list, so React forwards it but Clerk never looks at it). Keyed by
// signIn.*/signUp.* so the title/subtitle/action copy stays scoped to each
// flow. formButtonPrimary and the password placeholder are deliberately NOT
// set here - both are single global keys shared by every Clerk form in the
// app, so a value that's right for one page's button/field would be wrong
// on the other's (see ClerkButtonLabel, used per-page for formButtonPrimary
// instead).
const clerkLocalization = {
  signIn: {
    start: {
      title: "Back to the Vault.",
      subtitle:
        "Sign in to access your effects, Pro downloads, and CLI authentication.",
      actionText: "New here?",
      actionLink: "Create an account →",
    },
  },
  signUp: {
    start: {
      title: "Open the Vault.",
      subtitle:
        "Create an account and start with the Free Core. Install what you need. Own what you ship.",
      actionText: "Already have an account?",
      actionLink: "Sign in →",
    },
  },
  formFieldLabel__emailAddress: "Email",
  formFieldInputPlaceholder__emailAddress: "you@example.com",
  formFieldLabel__password: "Password",
};

export default function AppLayout({ children }) {
  return (
    <ClerkProvider
      localization={clerkLocalization}
      appearance={{
        cssLayerName: "clerk",
        theme: "simple",
        variables: {
          colorPrimary: "#ff5f00",
          colorPrimaryForeground: "#ffffff",
          colorBackground: "transparent",
          colorInputBackground: "rgba(255,255,255,0.08)",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "rgba(255,255,255,0.55)",
          colorDanger: "#fecaca",
          borderRadius: "9999px",
          fontFamily: "inherit",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
