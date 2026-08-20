import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import NavbarMobile from '@/components/WebsiteComps/NavbarMobile'
import Navbar from '@/components/WebsiteComps/Navbar'
import React from 'react'
import NavbarV3 from '@/homepage-v3/components/NavbarV3'

// NavbarV3 carries its own sheet below `lg`, so the pre-v3 NavbarMobile is not
// mounted here any more — two mobile bars would stack on top of each other.
export default function VaultShell({ children, effects = [] }) {
    return (
        <>
            {/* <NavbarV3 effects={effects} /> */}
            <Navbar/>
            <NavbarMobile/>
            <LenisSmoothScroll /> 
            {children}
        </>
    )
}
