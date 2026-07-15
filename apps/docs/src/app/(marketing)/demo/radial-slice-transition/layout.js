import React from'react'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import RadialSliceTransition from '@/components/radial-slice-transition'

export default function layout({ children }) {
 return (
 <RadialSliceTransition>
    <DemoHeader />
 {children}
 </RadialSliceTransition>
 )
}
