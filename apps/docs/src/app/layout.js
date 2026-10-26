import "@/lib/progress-event-polyfill";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import "./site.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import DeferredAnalytics from "@/components/WebsiteComps/DeferredAnalytics";
import DeferredGTM from "@/components/WebsiteComps/DeferredGTM";
import ButtonClickTracking from "@/components/WebsiteComps/ButtonClickTracking";
import {
  ImageObjectJsonLd,
  LocalBusiness,
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
  WebsiteJsonLd,
} from "@/lib/json-ld";
import { createRootMetadata } from "@/lib/seo-metadata";
import {
  CustomAnimationFormProvider,
  LazyCustomAnimationFormModal,
} from "@/components/WebsiteComps/modals/CustomAnimationForm";
import DeferredGlobals from "@/components/WebsiteComps/DeferredGlobals";
import { CookieConsentNudge } from "@/components/WebsiteComps/CookieConsentNudge";
import PixelPageTransition from "@/components/PageTransition/PixelPageTransition";
import SiteInteractions from "@/components/WebsiteComps/SiteInteractions";
import ReducedMotionConfig from "@/components/WebsiteComps/ReducedMotionConfig";
import { PageLoadOverlay } from "@/components/layout/PageLoadOverlay";
import { INTRO_GATE_SCRIPT } from "@/lib/intro-gate";

// The site's two faces: Aeonik Pro (headings / display) and Avenir Next (text),
// exposed to Tailwind as font-aeonik and font-avenir (globals.css @theme).
const aeonikPro = localFont({
  src: [
    { path: "../../public/assets/fonts/AeonikPro-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/assets/fonts/AeonikPro-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/AeonikPro-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/AeonikPro-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-aeonik",
  display: "swap",
  preload: false,
});

const avenirNext = localFont({
  src: [
    { path: "../../public/assets/fonts/AvenirNextCyr-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/assets/fonts/AvenirNextCyr-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/AvenirNextCyr-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/AvenirNextCyr-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-avenir",
  display: "swap",
  preload: false,
});

// Code face (code blocks, the homepage install windows, the remixer code box):
// exposed as font-code / font-mono via --font-code in globals.css
const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

export const metadata = createRootMetadata();

const CLEAR_STALE_CLERK_COOKIES = `(function(){
  var hasUat=document.cookie.indexOf('__client_uat=')!==-1;
  var hasSession=document.cookie.indexOf('__session=')!==-1;
  var uat=(document.cookie.match(/__client_uat=([^;]+)/)||[])[1];
  if(hasUat&&uat!=='0'&&!hasSession){
    var exp=new Date(0).toUTCString();
    document.cookie='__client_uat=0;path=/;expires='+exp+';secure;samesite=strict';
  }
})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      // The head script adds data-sidebar before React hydrates
      suppressHydrationWarning
      className={`${aeonikPro.variable} ${avenirNext.variable} ${plexMono.variable} antialiased`}
    >
      <head>
        {/* The page colour from the very first paint - before the stylesheet arrives
            (later in dev), the browser would otherwise paint its own default dark. */}
        <meta name="color-scheme" content="dark" />
        <style>{"html{background:#111111}"}</style>
        {/* The workspace sidebar's stored open / closed state, on <html> before the first
            paint (globals.css sizes the sidebar from it) - see VaultLayout. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.sidebar=localStorage.getItem("hyperiux-sidebar-expanded")==="false"?"collapsed":"expanded"}catch(e){}`,
          }}
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Homepage only: decides the loader / hero intro before the first paint, so the
            page paints from the server HTML instead of waiting under a cover for React */}
        <script id="intro-gate" dangerouslySetInnerHTML={{ __html: INTRO_GATE_SCRIPT }} />
        {/* <meta name="msvalidate.01" content="96AF31CC0830CC17D577425F2D8CEE36" /> */}
      </head>
      <body className="min-h-svh text-foreground">
        {/* Covers the page from first paint until it hydrates (then gsap.set to opacity 0) */}
        <PageLoadOverlay />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NCDH9PHF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* <script
          id="clear-stale-clerk-cookies"
          dangerouslySetInnerHTML={{ __html: CLEAR_STALE_CLERK_COOKIES }}
        /> */}
        {/* ClerkProvider deliberately absent here - it lives in
            (app)/layout.js so marketing routes ship zero Clerk scripts. */}
        <OrganizationJsonLd />
        <LocalBusiness />
        <ImageObjectJsonLd />
        <WebsiteJsonLd />
        <SoftwareApplicationJsonLd />
        
        <ReducedMotionConfig>
          <SiteInteractions>
            <PixelPageTransition />
            <CookieConsentNudge />
            
            <CustomAnimationFormProvider>
              {children}
              <LazyCustomAnimationFormModal />
              <DeferredGlobals />
            </CustomAnimationFormProvider>
          </SiteInteractions>
        </ReducedMotionConfig>
        <Analytics />
        <SpeedInsights />
        <DeferredGTM />
        {/* every button click with an id, as one GTM event (button_click) */}
        <ButtonClickTracking />
        <DeferredAnalytics />
      </body>
    </html>
  );
}
