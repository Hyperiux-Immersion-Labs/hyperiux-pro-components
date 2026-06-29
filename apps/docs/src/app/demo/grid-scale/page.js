import GridScale from '@/components/grid-scale'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'

const page = () => {
  return (
    <>
    <LenisSmoothScroll />
    <DemoHeader textColor='#ffffff' logoColor='#ffffff' />
    <GridScale/>
    <ScrollBottom/>
    </>
  )
}

export default page