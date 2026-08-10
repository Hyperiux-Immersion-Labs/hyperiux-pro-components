import React from 'react'
import ShearWipe from '@/components/shear-wipe'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { getDemoPageMetadata } from '@/lib/demo-metadata'

const page = () => {
  return (
   <>
    <DemoHeader logoColor='#ffffff' />
    <ShearWipe />
   </>
  )
}

export default page

export async function generateMetadata() {
  return getDemoPageMetadata('shear-wipe')
}
