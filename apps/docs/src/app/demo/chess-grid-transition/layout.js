import {ChessGridHeader} from'@/components/chess-grid-transition/ChessGridHeader'
import { ChessGridTransition } from'@/components/chess-grid-transition/ChessGridTransition'
import React from'react'

export default function layout({ children }) {
 return (
 <ChessGridTransition >
 <ChessGridHeader />
 {children}
 </ChessGridTransition>
 )
}
