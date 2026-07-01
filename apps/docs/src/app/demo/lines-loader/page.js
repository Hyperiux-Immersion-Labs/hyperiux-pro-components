import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import LinesLoader from "@/components/lines-loader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {
  return (
    <>
      <LenisSmoothScroll />
      <LinesLoader />
    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("lines-loader");
}
