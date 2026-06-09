'use client'

import React from'react'
import Link from'next/link'
import { usePathname } from'next/navigation'

export function ChessGridHeader() {
 const pathname = usePathname()

 return (
 <header className='fixed top-0 left-0 w-full z-50 p-8 flex items-center justify-between'>
 <Link href='/demo/chess-grid-transition' className='text-sm uppercase font-bold text-black'>
 Chess Grids
 </Link>
 <nav className='flex gap-4'>
 <Link  href='/demo/chess-grid-transition'  className={`text-sm text-black ${pathname ==='/demo/chess-grid-transition' ?'opacity-100' :'opacity-50'}`}
 >
 Page 1
 </Link>
 <Link  href='/demo/chess-grid-transition/page2'  className={`text-sm text-black ${pathname ==='/demo/chess-grid-transition/page2' ?'opacity-100' :'opacity-50'}`}
 >
 Page 2
 </Link>
 </nav>
 </header>
 )
}
