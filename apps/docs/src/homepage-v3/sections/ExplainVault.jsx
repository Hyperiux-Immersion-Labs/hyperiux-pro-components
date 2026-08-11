import LinkButton from '@/components/WebsiteComps/LinkButton'
import React from 'react'
import InstallationProcess from '../components/InstallationProcess'
import TextFillAnimationV3 from '../components/TextFillAnimationV3'

const SOLUTION_TEXT = 'Scroll systems, cursor effects, text reveals, page transitions, and WebGL scenes, refined on real client launches. Preview the moment the interaction layer of a website, the moments people notice when they scroll, hover,  move, navigate, read, and explore.'

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
                mobileTextSize="8vw"
                mobileTextWidth="90%"
                tabletTextSize="5vw"
                tabletTextWidth="88%"
                containerClassName="py-[15vw] font-neue-haas max-md:py-24"
            />
            <div className='w-full h-fit px-[3vw]' id="code-block">
                <InstallationProcess />

                <div className='flex w-full justify-center max-md:justify-center mt-[2vw] max-md:mt-0'>
                    <div className="text18 max-md:text-center text-light-grey font-geist-mono ">
                        <span className="inline-block">That&apos;s the whole workflow. The files land in your project. You change anything you want.&nbsp;</span>
                        <LinkButton className='max-md:mt-[2vw]' href={"#Workflow"} shimmer tilted={false} showArrow text={"See How it Works"} />
                    </div>
                </div>
            </div>
        </section>
    )
}
