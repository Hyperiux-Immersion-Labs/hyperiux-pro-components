'use client'

import React, { useState, useRef } from 'react'
import { useLenis } from 'lenis/react'
import OrisDotFillBtn from './OrisDotFillBtn'

export default function OrisNav() {
    const [hidden, setHidden] = useState(false)
    const prevScrollRef = useRef(0)

    useLenis(({ scroll, velocity, direction }) => {
        // At the very top, always show navbar
        if (scroll <= 60) {
            setHidden(false)
            prevScrollRef.current = scroll
            return
        }

        // When scrolling down (direction === 1), hide navbar
        if (direction === 1 || velocity > 0.1) {
            setHidden(true)
        }
        // When scrolling up (direction === -1), reveal navbar
        else if (direction === -1 || velocity < -0.1) {
            setHidden(false)
        }

        prevScrollRef.current = scroll
    })

    return (
        <header
            className={`text-oris-primary fixed top-0 left-0 z-100 flex items-center w-full justify-between oris-paddx py-[1.5vw] transition-transform duration-500 ${
                hidden ? '-translate-y-full' : 'translate-y-0'
            }`}
        >
            <p className="oris-text32">OrisDental</p>

            <OrisDotFillBtn
                text="Book Appointment"
                href="#oris-form"
                className="text-[1vw] max-md:text-sm font-medium"
            />
        </header>
    )
}
