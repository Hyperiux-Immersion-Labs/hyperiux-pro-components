
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import ColorfulCursorAura from '@/components/colorful-cursor-aura'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import SplitLine from '@/components/WebsiteComps/SplitLine';


const Page = () => {
  return (
    <>
    <DemoHeader />
      <LenisSmoothScroll />
   <ColorfulCursorAura/>
   <div className="hidden max-md:block absolute top-[80%] left-1/2 -translate-x-1/2 text-center">
   <SplitLine>

        <p className="text-zinc-700 max-md:text-[3vw] max-sm:text-[4vw] leading-[1.2] font-medium">
           Open on desktop to experience the effect
        </p>
   </SplitLine>
      </div>
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-white/10 p-3 text-center  max-md:hidden"
      >
        <h2 className="text-sm leading-none text-[#111111]">
          The aura keeps glowing.
        </h2>
        <p className="mt-2 text-xs leading-5 text-black/65">
          Colorful Cursor Aura renders continuously shifting color driven by
          cursor movement. The motion is the entire effect, so it
          can&apos;t be reduced.
        </p>
      </div>
    </>
  )
}

export default Page
export async function generateMetadata() {
  return getDemoPageMetadata("colorful-cursor-aura");
}
