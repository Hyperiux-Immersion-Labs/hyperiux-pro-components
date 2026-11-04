// Built using Hyperiux Vault: https://vault.hyperiux.com

import "./veyra-styles.css";
import { Geist } from "next/font/google";
import { VeyButton, Logo } from "./components/Buttons";
import { brand } from "./content";

const bodyFont = Geist({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-vey-body",
  display: "swap",
});

const NotFound = () => {
  return (
    <div className={`vey-page relative flex min-h-svh flex-col overflow-hidden ${bodyFont.variable}`}>
      <title>Page not found | Veyra</title>
      <div aria-hidden className="vey-glow pointer-events-none absolute right-[-10vw] bottom-[-30vh] h-[90vh] w-[70vw]" />
      <svg
        aria-hidden
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMaxYMax slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path d="M300 940 C860 900 1220 640 1460 60" fill="none" stroke="#aeb8e8" strokeOpacity="0.6" strokeWidth="1.4" />
        <path d="M420 960 C960 900 1290 660 1480 140" fill="none" stroke="#aeb8e8" strokeOpacity="0.3" strokeWidth="1" />
      </svg>
      <header className="relative vey-container py-[2vw] max-lg:py-[4vw] max-md:py-[6vw]">
        <a href={brand.homeHref} aria-label={`${brand.name} home`} className="w-fit">
          <Logo />
        </a>
      </header>
      <main className="relative flex flex-1 flex-col justify-center gap-8 vey-container py-[10vh]">
        <span className="font-vey-mono text-14 text-vey-lilac">404</span>
        <h1 className="w-[60%] max-lg:w-[85%] max-md:w-full">This path is not connected yet.</h1>
        <p className="w-[32%] text-28 text-vey-dim max-lg:w-[60%] max-md:w-full">
          The page you are looking for has moved or never existed. Head back and pick up the thread.
        </p>
        <div>
          <VeyButton href={brand.homeHref}>Back to home</VeyButton>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
