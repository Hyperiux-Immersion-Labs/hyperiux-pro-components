
import MagneticImageTrail from '@/components/magnetic-image-trail'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitLine from '@/components/WebsiteComps/SplitLine'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <div className='h-screen relative'>

        <DemoHeader />


        <h1 className='text-black sr-only text-lg text-center leading-[1.2]'>
          Glide around to reveal the magic
        </h1>
        <MagneticImageTrail />
        <div
          aria-live="polite"
          className="pointer-events-none fixed bottom-4 right-4 z-9000 w-fit max-w-65 rounded-md border border-black/10 bg-white/40 p-3 text-center max-md:hidden"
        >
          <h2 className="text-sm leading-none text-[#111111]">
            The images keep pulling.
          </h2>
          <p className="mt-2 text-xs leading-5 text-black/65">
            Magnetic Image Trail animates images being drawn toward your
            cursor in real time. Pausing that motion would remove the
            effect.
          </p>
        </div>
      </div >
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("magnetic-image-trail");
}
