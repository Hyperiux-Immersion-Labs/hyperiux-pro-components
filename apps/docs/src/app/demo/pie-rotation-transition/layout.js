import {PiechartTransition} from'@/components/pie-rotation-transition/PiechartTransition'
import {PieChartHeader} from'@/components/pie-rotation-transition/PieChartHeader'
import React from'react'

export default function layout({ children }) {
 return (
 <PiechartTransition>
 <PieChartHeader />
 {children}
 </PiechartTransition>
 )
}
