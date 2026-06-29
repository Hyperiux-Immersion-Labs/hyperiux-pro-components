
import ParallaxGallery from '@/components/parallax-gallery'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import HeadAnim from '@/components/Animations/HeadAnim'


const page = () => {
  return (
    <>

    <DemoHeader logoColor='#ffffff' textColor='#ffffff' />
    <div className='h-full relative'>

   
 <div
 className="fixed left-1/2 min-w-[20vw] max-md:top-50 max-md:min-w-full z-50  -translate-x-1/2 top-20"
 >
  <HeadAnim>

  <h1 className='text-[1.5vw] max-md:text-[3.5vw]  text-center uppercase max-sm:text-[5.5vw] text-neutral-300 tracking-widest'>

 Parallax Gallery
  </h1>
  </HeadAnim>
 </div>

    <ParallaxGallery />
    </div>
    <ScrollBottom textColor='#ffffff' className='bottom-[0.1%] max-md:bottom-[5%] gap-[0.2vw]' />
    </>
  )
}

export default page