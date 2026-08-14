import dynamic from 'next/dynamic'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import React from 'react'
import NavbarV3 from '@/homepage-v3/components/NavbarV3'

const Navbar = dynamic(() => import('@/components/WebsiteComps/Navbar'), { ssr: true })
const NavbarMobile = dynamic(() => import('@/components/WebsiteComps/NavbarMobile'), { ssr: true })

export default function VaultShell({ children, effects = [] }) {
    return (
        <>
            <NavbarV3 effects={effects} />
            <NavbarMobile />
            <LenisSmoothScroll />
            {children}
        </>
    )
}
