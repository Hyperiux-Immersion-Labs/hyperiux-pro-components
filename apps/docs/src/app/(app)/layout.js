import { ClerkProvider } from "@clerk/nextjs";

// ClerkProvider lives here - NOT in the root layout - so marketing routes
// ((marketing) group: /, /docs, /legal, /tech, /demo, ...) ship zero Clerk
// scripts. Every route that needs auth context (dashboard, effects, sign-in,
// sign-up, waitlist's <Waitlist> widget, pricing's plan-aware UI, cli-auth)
// lives under this group. Route groups don't change URLs.
export default function AppLayout({ children }) {
  return (
    <ClerkProvider
      waitlistUrl="/waitlist"
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
