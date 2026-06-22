import React from'react'
import { BlockTransition } from'@/components/block-transition/BlockTransition'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'

export default function layout({ children }) {
 return (
 <BlockTransition>
    <DemoHeader />
 {children}
 </BlockTransition>
 )
}
