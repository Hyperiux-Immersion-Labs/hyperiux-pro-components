import React from 'react'
import { TextFillAnimation } from '../WebsiteComps/TextFillAnimation'
import Image from 'next/image'
import CodeBlockWorkflow from './CodeBlockWorkFlow'
import Link from 'next/link'
import RandomBlur from '../WebsiteComps/RandomBlur'
import ShimmerText from '../WebsiteComps/ShimmerText'

const Solution = () => {
    return (
        <section className='w-full h-fit px-[3vw] py-[10%]' id='solution'>
            <RandomBlur as="h2" className="text110 w-full text-center">
                Vault is That Layer - <span className='text-[#ff5f00]'>Installable</span>
            </RandomBlur>

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
            <div className='w-full h-fit px-[2vw]' id="code-block">
                {/* <Image src={"/assets/homepage/code-blocks.png"} alt='code block' className='w-full h-full object-contain' width={1920} height={1080}/> */}
                <CodeBlockWorkflow />

                <div className='flex w-full justify-end mt-[2vw] max-sm:mt-0'>
                    <div className="pl-[0.65vw] text24 max-sm:leading-[1.4] max-md:text-center leading-relaxed text-white/62 max-md:pl-0 max-md:text-sm! ">
                       <ShimmerText baseColor="#939393" shimmerColor="#ffffff">
                        That’s the whole workflow. The files land in your project. You
                        change anything you want.{" "}
                        </ShimmerText> 
                        <Link href={"/effects"} className="relative text-white">

                            See How it Works
                            <div className=" w-full absolute left-0 bottom-[-10%] h-[1px] bg-white bottom-underline" />
                        </Link>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default Solution