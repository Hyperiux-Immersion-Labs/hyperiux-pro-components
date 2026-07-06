import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import Script from "next/script";
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
import CustomAnimationFormModal from "@/components/WebsiteComps/modals/CustomAnimationFormModal";
import AnnouncementBar from "@/components/WebsiteComps/AnnouncementBar";

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

// Runs synchronously before any HTML is painted — adds a class when loader hasn't run yet
// so the CSS below can hide body content, preventing a flash of hero content before the loader canvas appears.
const LOADER_FIRST_VISIT_BLOCK = `(function(){try{if(sessionStorage.getItem('hyperiux-loader-has-run')!=='true'&&window.location.pathname==='/'){document.documentElement.classList.add('loader-first-visit');}}catch(e){}})();`;

const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NCDH9PHF');`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: GTM_SNIPPET }} />
        <script dangerouslySetInnerHTML={{ __html: LOADER_FIRST_VISIT_BLOCK }} />
      </head>
      <body className="min-h-dvh bg-background text-foreground font-sans">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NCDH9PHF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <script
          dangerouslySetInnerHTML={{ __html: CLEAR_STALE_CLERK_COOKIES }}
        />
        <AnnouncementBar />
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
