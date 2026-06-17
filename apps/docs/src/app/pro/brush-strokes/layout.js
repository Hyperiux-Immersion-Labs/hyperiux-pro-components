import BrushStrokesTransition from'@/components/showcase/transitions/BrushStroke/BrushStrokesTransition'
import React from'react'

export default function layout({ children }) {
 return (
 <BrushStrokesTransition>
 {children}
 </BrushStrokesTransition>
 )
}
