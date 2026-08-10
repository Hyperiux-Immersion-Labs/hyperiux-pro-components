import LinkButton from '@/components/WebsiteComps/LinkButton'
import React from 'react'
import InstallationProcess from '../components/InstallationProcess'
import TextFillAnimationV3 from '../components/TextFillAnimationV3'

const SOLUTION_TEXT = 'Scroll systems, cursor effects, text reveals, page transitions, and WebGL scenes, refined on real client launches. Preview the moment you need, install it with one command, then tune it in your own repo. It’s not a black box. It’s not another UI kit. It’s real, inspectable code you own.'

export default function ExplainVault() {
    return (
        <section id='explain-vault' className='w-full h-fit'>
            <TextFillAnimationV3
                as="p"
                text={SOLUTION_TEXT}
                textColor="#ffffff"
                primaryColor="#ff5f00"
                dimColor="#272727"
                id="break-heading"
                textSize="3.25vw"
                textWidth="90%"
                mobileTextSize="7vw"
                mobileTextWidth="95%"
                tabletTextSize="5vw"
                tabletTextWidth="88%"
                containerClassName="py-[15vw] font-neue-haas max-md:py-24"
            />
            <div className='w-full h-fit px-[3vw]' id="code-block">
                <InstallationProcess />

                <div className='flex w-full justify-center max-md:justify-center mt-[2vw] max-md:mt-0'>
                    <div className=" text18 text-light-grey font-geist-mono ">
                        <span className="inline-block">That&apos;s the whole workflow. The files land in your project. You change anything you want.&nbsp;</span>
                        <LinkButton href={"#Workflow"} shimmer tilted={false} showArrow text={"See How it Works"} />
                    </div>
                </div>
            </div>
        </section>
    )
}
