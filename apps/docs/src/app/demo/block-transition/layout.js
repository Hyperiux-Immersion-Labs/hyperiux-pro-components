import React from'react'
import {BlockHeader} from'@/components/block-transition/BlockHeader'
import { BlockTransition } from'@/components/block-transition/BlockTransition'

export default function layout({ children }) {
 return (
 <BlockTransition>
 <BlockHeader />
 {children}
 </BlockTransition>
 )
}
