// Built using Hyperiux Vault: https://vault.hyperiux.com
import dynamic from "next/dynamic";
import { pageMetadata } from "../metadata";
import AboutHero from "../components/about/AboutHero";

const Beliefs = dynamic(() => import("../components/about/Beliefs"));
const Team = dynamic(() => import("../components/about/Team"));
const ShelfSpace = dynamic(() => import("../components/about/ShelfSpace"));

export const metadata = pageMetadata(
  "About | The Missing Pixel",
  "A senior brand and digital studio with homes in Delhi, London, Dubai and New York. Meet the team and what we believe.",
  "/about",
);

const page = () => (
  <>
    <AboutHero />
    <Beliefs />
    <Team />
    <ShelfSpace />
    <div aria-hidden className="h-[10vh]" />
  </>
);

export default page;
