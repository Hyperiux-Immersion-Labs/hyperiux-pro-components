import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import "highlight.js/styles/night-owl.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  ImageObjectJsonLd,
  LocalBusiness,
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
  WebsiteJsonLd,
} from "@/lib/json-ld";
import { createRootMetadata } from "@/lib/seo-metadata";
import PixelRandom from "@/components/pixel-random";
import AccessRequestModal from "@/components/WebsiteComps/modals/AccessRequestModal";
import CustomAnimationFormModal from "@/components/WebsiteComps/modals/CustomAnimationFormModal";

const layGrotesk = localFont({
  src: [
    {
      path: "../fonts/laygrotesk-trial-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/laygrotesk-trial-medium.woff2",
      weight: "500",
      style: "medium",
    },
  ],
  variable: "--font-laygrotesk",
  display: "swap",
});

export const metadata = createRootMetadata();

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${layGrotesk.className} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground font-sans">
        {/* <PixelRandom color="#ff5f00"> */}
        <ClerkProvider
          waitlistUrl="#"
          appearance={{
            cssLayerName: "clerk",
            theme: "simple",
            variables: {
              colorPrimary: "#ff5f00",
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
          <OrganizationJsonLd />
          <LocalBusiness />
          <ImageObjectJsonLd />
          <WebsiteJsonLd />
          <SoftwareApplicationJsonLd />
          {children}
          <Suspense>
            <AccessRequestModal />
            <CustomAnimationFormModal />
          </Suspense>
          <Analytics />
          <SpeedInsights />
        </ClerkProvider>
        {/* </PixelRandom> */}
      </body>
    </html>
  );
}
