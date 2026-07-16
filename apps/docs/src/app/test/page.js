import TextFillAnimation from '@/components/text-fill-animation'
import React from 'react'
const SOLUTION_TEXT = 'Scroll systems, cursor effects, text reveals, page transitions, and WebGL scenes, refined on real client launches. Preview the moment you need, install it with one command, then tune it in your own repo. It’s not a black box. It’s not another UI kit. It’s real, inspectable code you own.'


export default function page() {
    return (
        <TextFillAnimation
            text={SOLUTION_TEXT}
            textColor="#ffffff"
            primaryColor="#ff5f00"
            dimColor="#272727"
            id="break-heading"
            textSize="4vw"
            textWidth="100%"
            mobileTextSize="7vw"
            mobileTextWidth="95%"
            tabletTextSize="5vw"
            tabletTextWidth="88%"
        />
    )
}
