
import MagneticImageTrail from '@/components/magnetic-image-trail'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
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
      </div >
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("magnetic-image-trail");
}
