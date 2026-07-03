import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import {
  ImageObjectJsonLd,
  LocalBusiness,
  OrganizationJsonLd,
  SoftwareApplicationJsonLd,
  WebsiteJsonLd,
} from "@/lib/json-ld";
import { createRootMetadata } from "@/lib/seo-metadata";
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
      style: "normal",
    },
  ],
  variable: "--font-laygrotesk",
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
    <html lang="en" className={`${layGrotesk.className} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground font-sans">
        <script
          dangerouslySetInnerHTML={{ __html: CLEAR_STALE_CLERK_COOKIES }}
        />
        <ClerkProvider
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
          <OrganizationJsonLd />
          <LocalBusiness />
          <ImageObjectJsonLd />
          <WebsiteJsonLd />
          <SoftwareApplicationJsonLd />
          {children}
          <Suspense>
            <CustomAnimationFormModal />
          </Suspense>
          <Analytics />
          <SpeedInsights />
          <GoogleTagManager gtmId="GTM-NCDH9PHF" />
          <GoogleAnalytics gtagId="G-S4RCCRVS5Y" />
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","xg3k9tc0gm");`,
            }}
          />
          <Script
            id="openpanel-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.op=window.op||function(){var n=[];return new Proxy(function(){arguments.length&&n.push([].slice.call(arguments))},{get:function(t,r){return"q"===r?n:function(){n.push([r].concat([].slice.call(arguments)))}},has:function(t,r){return"q"===r}})}();window.op('init',{clientId:'45f34339-5b18-484e-a126-a77b7d470584',trackScreenViews:true,trackOutgoingLinks:true,trackAttributes:true});`,
            }}
          />
          <Script
            src="https://openpanel.dev/op1.js"
            strategy="afterInteractive"
          />
          <Script
            id="rb2b"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function(key){if(window.reb2b)return;window.reb2b={loaded:true};var s=document.createElement("script");s.async=true;s.src="https://ddwl4m2hdecbv.cloudfront.net/b/"+key+"/"+key+".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(s,document.getElementsByTagName("script")[0]);}("5NRP9H7J4EO1");`,
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  );
}
