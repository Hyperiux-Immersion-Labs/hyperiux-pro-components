import ScrambleTextWrapper from './ScrambleTextWrapper'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'

const page = () => {
  return (
    <>
    <DemoHeader />
    <ScrambleTextWrapper/>
    <ScrollBottom textColor='text-black' />
    </>
  )
}

export default page