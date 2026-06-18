import InteractiveListPreview from '@/components/interactive-list-preview'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'

const page = () => {
  return (
    <>
    <DemoHeader textColor='#ffffff' logoColor='#ffffff' />
    <InteractiveListPreview/>
    </>
  )
}

export default page