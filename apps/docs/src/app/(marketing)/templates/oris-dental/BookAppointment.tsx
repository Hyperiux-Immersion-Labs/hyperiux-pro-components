'use client'

import React from 'react'
import Image from 'next/image'
import ContactForm from './effects/contact-form/ContactForm'
import SplitTextLines from './effects/split-text-lines/SplitTextLines'
import FormBg from './assets/animated-form-bg.png'

export default function BookAppointment() {
    return (
        <section id="oris-form" className="w-full bg-white pt-[6vw]">
            <div className="relative w-full rounded-t-[2.2vw] max-md:rounded-2xl overflow-hidden min-h-[80vh] flex items-start justify-between oris-paddx py-[5.6vw] max-md:p-6 max-md:flex-col max-md:gap-8">
                {/* Background Image */}
                <Image
                    src={FormBg}
                    alt="Dental clinic background"
                    fill
                    sizes="100vw"
                    className="object-cover pointer-events-none z-0"
                    priority
                />

                {/* Left Content */}
                <div className="z-10 text-white flex pt-[1vw] flex-col justify-center max-md:max-w-full">
                    <SplitTextLines as="h2" className="oris-text64 max-w-[34vw]">
                        The first step to the smile you deserve
                    </SplitTextLines>
                    <SplitTextLines as="p" className="oris-text22 max-w-[36vw] mt-[2vw] max-md:mt-4" delay={0.2}>
                        Leave a request and our care coordinator will call you back
                        within 15 minutes. Your first consultation with a 3D scan is
                        free.
                    </SplitTextLines>
                </div>

                {/* Right Floating Form Card */}
                <div className="z-10 bg-white rounded-[1.8vw] max-md:rounded-2xl p-[2vw] max-md:p-6 w-[45vw] max-md:w-full ">
                    <h3 className="text-[1.8vw] max-md:text-[6vw] font-medium text-[#1A1A1A] mb-[1.5vw] max-md:mb-4">
                        Get in touch
                    </h3>
                    <ContactForm />
                </div>
            </div>
        </section>
    )
}
