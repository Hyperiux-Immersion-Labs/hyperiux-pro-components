import Navbar from '@/components/Reusable/Navbar'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import React from 'react'

export default function VaultShell({ children }) {
    return (
        <>
            <Navbar />
            <LenisSmoothScroll />
            {children}
        </>
    )
}
