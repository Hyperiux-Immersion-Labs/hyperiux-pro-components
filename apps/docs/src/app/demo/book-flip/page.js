import React from 'react'
import BookFlip from '@/components/book-flip'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'

const page = () => {
  return (
    <>
    <DemoHeader textColor='#fffff' logoColor='#ffffff' />
      <BookFlip />
    </>
  )
}

export default page