import Navbar from '@/components/WebsiteComps/Navbar'
import NavbarMobile from '@/components/WebsiteComps/NavbarMobile'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import React from 'react'

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
