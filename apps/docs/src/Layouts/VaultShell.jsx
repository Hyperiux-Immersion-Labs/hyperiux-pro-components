import dynamic from 'next/dynamic'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import React from 'react'

const Navbar = dynamic(() => import('@/components/WebsiteComps/Navbar'), { ssr: true })
const NavbarMobile = dynamic(() => import('@/components/WebsiteComps/NavbarMobile'), { ssr: true })

export default function VaultShell({ children, effects = [] }) {
    return (
        <>
            <Navbar effects={effects} />
            <NavbarMobile />
            <LenisSmoothScroll />
            {children}
        </>
    )
}
