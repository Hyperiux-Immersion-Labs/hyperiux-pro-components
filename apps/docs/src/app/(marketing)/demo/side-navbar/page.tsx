import SideNavbar from '@/components/side-navbar'
import { getDemoPageMetadata } from '@/lib/demo-metadata'
import React from 'react'

const page = () => {
  return (
    <>
    <div className='w-screen h-screen bg-white'>
    <SideNavbar/>

    </div>
    </>
  )
}

export default page

export async function generateMetadata() {
  return getDemoPageMetadata("side-navbar");
}
