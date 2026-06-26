import React from 'react'
import { TextFillAnimation } from '../WebsiteComps/TextFillAnimation'
import Image from 'next/image'

const Solution = () => {
    return (
        <section className='w-full h-fit px-[3vw] py-[10%]' id='solution'>
            <h2 className='text-[5.5vw] w-full text-center'>
                Vault is That Layer - <span className='italic text-[#ff5f00]'>Installable</span>
            </h2>
            <div className='w-full h-fit flex justify-center items-center'>
                <TextFillAnimation
                    text="Scroll systems, cursor effects, text reveals, page transitions, and WebGL scenes, refined on real client
                    launches. Preview the moment you need, install it with one command, then tune it in your own repo.
                    It’s not a black box. It’s not another UI kit. It’s real, inspectable code you own."
                    textSize="4vw"
                    textWidth="100%"
                    textColor="#ffffff"
                    primaryColor='#ff5f00'
                    dimColor="#272727"
                    id="hero-break"
                    containerClassName="text-start"
                    mobileTextSize="8vw"
                    mobileTextWidth="92%"
                    tabletTextSize='6vw'
                    tabletTextWidth='88%'
                />

            </div>
            <div className='w-full h-[40vw]' id="code-block">
                <Image src={"/assets/homepage/code-blocks.png"} alt='code block' className='w-full h-full object-contain' width={1920} height={1080}/>
            </div>

        </section>
    )
}

export default Solution