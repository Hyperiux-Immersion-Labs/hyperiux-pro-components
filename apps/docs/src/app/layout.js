import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import "highlight.js/styles/night-owl.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

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

export const metadata = {
  title: "Hyperiux Vault - Beautiful Effects for Your Website",
  description:
    "A collection of animated effects and UI components. Copy-paste or use our CLI to add stunning animations to your Next.js project.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${layGrotesk.className} antialiased`}>
        <body className="min-h-screen bg-background text-foreground font-sans">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}

