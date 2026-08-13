'use client'
import LinkButton from '@/components/WebsiteComps/LinkButton'
import InstallationProcess from '../components/InstallationProcess'
import TextFillPixelV3 from '../components/TextFillPixelV3'
import { useFadeUp } from '@/components/Animations/gsapAnimations'

const SOLUTION_TEXT = 'Scroll systems, cursor effects, text reveals, page transitions, and WebGL scenes, refined on real client launches. Preview the moment the interaction layer of a website, the moments people notice when they scroll, hover,  move, navigate, read, and explore.'

export default function ExplainVault() {
    useFadeUp()
    return (
        <section id='explain-vault' className='w-full mt-[-8vw] h-fit'>

            {/* <TextFillAnimationV3
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
            /> */}
            <TextFillPixelV3
                as="h2"
                text={SOLUTION_TEXT}
                id="break-heading"
                textColor="#ffffff"
                primaryColor="#ff5f00"
                dimColor="#272727"
                pixelSize={3}
                direction='up'
                stagger={40}
                bandFraction={0.65}
                settleBlend={0.45}
                className="text-[8vw] leading-[1.18] sm:text-[5vw] md:text-[3.25vw]"
                wrapperClassName="w-[90%] sm:w-[88%] md:w-[90%]"
                containerClassName="py-[15vw] font-neue-haas max-md:py-24"
            />
            <div className='w-full  h-fit px-[3vw]' id="code-block">
                <InstallationProcess />

                <div className='flex w-full justify-center max-md:justify-center mt-[2vw] max-md:mt-0'>
                    <div className="text18 fadeup max-md:text-center text-light-grey font-geist-mono ">
                        <span className="inline-block">That&apos;s the whole workflow. The files land in your project. You change anything you want.&nbsp;</span>
                        <LinkButton underline={false} className='max-md:mt-[2vw]' href={"#Workflow"} shimmer tilted={false} showArrow text={"See How it Works"} />
                    </div>
                </div>
            </div>
        </section>
    )
}
