import DraggableCanvas from '@/components/draggable-canvas'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'

const page = () => {
  return (
    <>
    <DemoHeader textColor='#ffffff' logoColor='#ffffff' />
    <DraggableCanvas/>
    </>
  )
}

export default page