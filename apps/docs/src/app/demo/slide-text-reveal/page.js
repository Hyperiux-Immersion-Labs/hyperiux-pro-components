
import SlideTextWrapper from './SlideTextWrapper'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'

const page = () => {
  return (
   <>
   <DemoHeader textColor='#ffffff' logoColor='#ffffff' />
    <SlideTextWrapper />
    <ScrollBottom />
   </>
  )
}

export default page