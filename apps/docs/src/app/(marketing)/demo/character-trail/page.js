
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import CharacterTrail from '@/components/character-trail'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {

  return (
    <>
<LenisSmoothScroll />
<DemoHeader/>
<CharacterTrail/>
<div
  aria-live="polite"
  className="pointer-events-none fixed top-25 right-8 z-50000 w-fit max-w-65 rounded-md border backdrop-blur-md bg-white/10 border-black/10  p-3 text-center max-md:hidden"
>
  <h2 className="text-sm leading-none text-[#111111]">
    The characters keep trailing.
  </h2>
  <p className="mt-2 text-xs leading-5 text-black/65">
    Character Trail redraws letters along your cursor&apos;s path in real
    time. The animation can&apos;t be reduced without removing the effect.
  </p>
</div>
    </>
  )
}

export async function generateMetadata() {
  return getDemoPageMetadata("character-trail");
}
