import React from'react'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import BlockTransition from '@/components/block-transition'

export default function layout({ children }: { children: React.ReactNode }) {
 return (
 <BlockTransition>
    <DemoHeader />
 {children}
 </BlockTransition>
 )
}
