import React from'react'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { PiechartTransition } from '@/components/pie-slice-transition'

export default function layout({ children }) {
 return (
 <PiechartTransition>
    <DemoHeader />
 {children}
 </PiechartTransition>
 )
}
