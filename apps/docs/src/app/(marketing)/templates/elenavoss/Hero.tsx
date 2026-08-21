"use client"
import Image from 'next/image'
import elenavossHeroImg from './assets/elenavoss-hero-img.png'
import portfolio1Img from './assets/hero-portfolio-1.png'
import portfolio3Img from './assets/hero-portfolio-3.png'
import portfolio2Img from './assets/hero-portfolio-2.png'
import portfolio4Img from './assets/hero-portfolio-4.png'
import { useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import OverflowTextReveal from './effects/overflow-text-reveal'
gsap.registerPlugin(ScrollTrigger)

const Hero = () => {
    useEffect(()=>{
        if(globalThis.innerWidth>1024){
            gsap.to(".hero-container",{
               scale:0.5,
               ease:"power2.inOut",
               scrollTrigger:{
                   trigger:"#hero",
                   start:"top top",
                   end:"bottom bottom",
                   scrub:true,
                   // markers:true
               }
            })
        }
    })
    return (
        <section className="relative w-screen h-[300vh]  max-[1025px]:h-fit" id='hero'>
            <div
                className="w-screen h-screen sticky top-0 flex justify-between items-center hero-container px-[4vw] z-2 max-[1025px]:relative max-[1025px]:items-start max-[1025px]:pt-[40vw]"
                style={{
                    backgroundColor: '#180d08',
                    backgroundImage: `
                        radial-gradient(65% 55% at 92% 6%, #F0640D 0%, rgba(240,100,13,0) 65%),
                        radial-gradient(60% 55% at 4% 82%, #EC690F 0%, rgba(236,105,15,0) 65%),
                        radial-gradient(75% 80% at 48% 42%, #B01205 0%, rgba(176,18,5,0) 70%),
                        linear-gradient(180deg, #D8470A 0%, #C0300A 28%, #B01205 46%, #7A1C08 68%, #2A1108 88%, #180D08 100%)
                    `,
                }}
            >
                <div className='w-full h-fit flex justify-between max-md:flex-col max-md:gap-8'>
                    <div className=' w-[45%] leading-30! max-[1025px]:w-[62%] max-md:w-full'>
                    <OverflowTextReveal>
                    <h1 className='text-[7.5rem] max-[1025px]:text-[4.4rem] max-[1025px]:leading-[1.05]! max-md:text-[3.5rem] max-md:leading-[1.1]!'>
                        Visualise
                        Your Mind
                        in Motion
                    </h1>
                    </OverflowTextReveal>

                    </div>
                    <div className='w-[10%] flex flex-col justify-between text-end text-[1.25vw] leading-[1.15] py-[2vw] max-[1025px]:w-[40%] max-[1025px]:text-[2.1vw] max-md:w-full max-md:text-start max-md:flex-col-reverse  max-md:text-[4.5vw] max-md:gap-[7vw] max-md:py-0'>
                        <OverflowTextReveal splitBy='lines'>
                        <p>
                            Award winning Designs
                        </p>

                        </OverflowTextReveal>
                        <OverflowTextReveal splitBy='lines'>

                        <p>
                            Creative<br/>
                            Web Designer
                        </p>
                        </OverflowTextReveal>


                    </div>


                </div>
                <div className='absolute top-0 left-1/2 -translate-x-[47%] w-[75%] h-full max-[1025px]:w-[90%] max-md:w-full max-md:top-auto max-md:bottom-0 max-md:h-[35vh] max-md:-translate-x-1/2'>
                    <Image src={elenavossHeroImg} alt='hero-img' className='w-full h-full object-contain' />
                </div>

            </div>
            <div className='absolute inset-0 w-full h-full bg-[#080808] max-[1025px]:static  '>
                <div className='w-full h-screen sticky top-0 px-[4vw] flex gap-[2.5vw] overflow-hidden'>
                    <div className='w-[50%] h-fit flex flex-col gap-[2.5vw] marquee-1 max-[1025px]:hidden'>
                        <div className='w-full h-[27vw]  overflow-hidden'>
                            <Image src={portfolio1Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[27vw]  overflow-hidden'>
                            <Image src={portfolio3Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[27vw]  overflow-hidden'>
                            <Image src={portfolio1Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[27vw]  overflow-hidden'>
                            <Image src={portfolio3Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        

                    </div>
                    <div className='h-fit max-[1025px]:flex flex-col gap-[2.5vw] marquee-1 max-[1025px]:w-full hidden '>
                        <div className='w-full h-[60vw]  overflow-hidden'>
                            <Image src={portfolio1Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[60vw]  overflow-hidden'>
                            <Image src={portfolio2Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[60vw]  overflow-hidden'>
                            <Image src={portfolio3Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[60vw]  overflow-hidden'>
                            <Image src={portfolio4Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[60vw]  overflow-hidden'>
                            <Image src={portfolio1Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[60vw]  overflow-hidden'>
                            <Image src={portfolio2Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[60vw]  overflow-hidden'>
                            <Image src={portfolio3Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[60vw]  overflow-hidden'>
                            <Image src={portfolio4Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        

                    </div>
                    <div className='w-[50%] h-fit flex flex-col gap-[2.5vw] marquee-2 max-[1025px]:hidden'>
                        <div className='w-full h-[27vw]  overflow-hidden'>
                            <Image src={portfolio2Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[27vw]  overflow-hidden'>
                            <Image src={portfolio4Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[27vw]  overflow-hidden'>
                            <Image src={portfolio2Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>
                        <div className='w-full h-[27vw]  overflow-hidden'>
                            <Image src={portfolio4Img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                        </div>

                    </div>


                </div>

            </div>

        </section>
    )
}

export default Hero