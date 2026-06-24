import dynamic from 'next/dynamic'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import React from 'react'

const Navbar = dynamic(() => import('@/components/WebsiteComps/Navbar'), { ssr: false })
const NavbarMobile = dynamic(() => import('@/components/WebsiteComps/NavbarMobile'), { ssr: false })

export default function VaultShell({ children }) {
    return (
        <>
            <Navbar />
            <NavbarMobile />
            <LenisSmoothScroll />
            {children}
        </>
    )
}
