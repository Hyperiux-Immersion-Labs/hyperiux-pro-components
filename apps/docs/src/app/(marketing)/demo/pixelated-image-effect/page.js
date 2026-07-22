import PixelatedImageEffect from "@/components/pixelated-image-effect";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {
  return (
    <>
      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
      
      <PixelatedImageEffect
        src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-02.jpg"
        alt="Pixelated nature scene"
      />
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center  backdrop-blur-sm max-md:hidden"
      >
        <h2 className="text-sm leading-none text-white">
          The pixels keep shifting.
        </h2>
        <p className="mt-2 text-xs leading-5 text-white/65">
          Pixelated Image Effect changes pixelation based on cursor
          position in real time. Since the transition is driven entirely by
          motion, reduced motion can&apos;t be applied here.
        </p>
      </div>
    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("pixelated-image-effect");
}
