import Navbar from '@/components/Reusable/Navbar'
import NavbarMobile from '@/components/Reusable/NavbarMobile'
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
