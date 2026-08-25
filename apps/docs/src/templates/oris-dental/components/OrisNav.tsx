'use client'

import React, { useState, useRef } from 'react'
import { useLenis } from 'lenis/react'

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

            <button className="px-[2vw] py-[.7vw] rounded-full oris-bg-primary text-white cursor-pointer hover:scale-[0.98] active:scale-95 transition-all">
                Book Appointment
            </button>
        </header>
    )
}
