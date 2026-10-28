// Built using Hyperiux Vault: https://vault.hyperiux.com
import { ROUTES } from "./routes";
import { FadeUp, MaskReveal, PAGE_DELAY } from "./components/Animations/gsapAnim";
import PixelButton from "./components/Buttons/PixelButton";
import Breadcrumb from "./components/shared/Breadcrumb";

// data-mpx-404 hides the layout's footer CTA and footer (see missing-pixel-styles.css)
const NotFound = () => (
  <section data-mpx-404 className="flex min-h-svh flex-col items-center justify-center gap-11 text-center px-[5vw] py-[3vw] max-lg:gap-8 max-lg:px-[6vw] max-lg:py-[10vh] max-md:gap-9 max-md:px-[7vw] max-md:py-[10vw] max-md:pt-[30vw]">
    <Breadcrumb crumbs={[{ label: "Home", href: ROUTES.home }, { label: "404" }]} />
    <div className="flex flex-col items-center gap-8 max-md:gap-6">
      <MaskReveal as="h1" delay={PAGE_DELAY} className="text-[22vw]! leading-[0.85]! tracking-[-1vw]! max-md:text-[38vw]!">
        <span className="mpx-shimmer">404</span>
      </MaskReveal>
      <FadeUp delay={PAGE_DELAY + 0.3} className="flex flex-col items-center gap-8 max-md:gap-6">
        <p className="font-mpx-head text-40 font-medium">This page went missing.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <PixelButton label="Back to home" href={ROUTES.home} icon />
          <PixelButton label="See the work" href={ROUTES.work} variant="outline" />
        </div>
      </FadeUp>
    </div>
  </section>
);

export default NotFound;
