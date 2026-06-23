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
import PixelRandom from "@/components/showcase/transitions/PixelRandom/PixelRandomTransition";
import AccessRequestModal from "@/components/auth/AccessRequestModal";

const layGrotesk = localFont({
  src: [
    {
      path: "../fonts/laygrotesk-trial-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/laygrotesk-trial-medium.otf",
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
          <ClerkProvider waitlistUrl="/request-access">
            <OrganizationJsonLd />
            <LocalBusiness />
            <ImageObjectJsonLd />
            <WebsiteJsonLd />
            <SoftwareApplicationJsonLd />
            {children}
            <Suspense>
              <AccessRequestModal />
            </Suspense>
            <Analytics />
            <SpeedInsights />
          </ClerkProvider>
        {/* </PixelRandom> */}
      </body>
    </html>
  );
}
