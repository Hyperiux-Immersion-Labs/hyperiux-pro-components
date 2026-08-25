import Image from 'next/image'
import React from 'react'
import SplitTextLines from '../components/SplitTextLines'

const GALLERY_IMAGES = [
    { id: 1, src: '/templates/oris-detal/imgs/hc1.png', alt: 'Dental consultation' },
    { id: 2, src: '/templates/oris-detal/imgs/hc2.png', alt: 'Doctor reviewing treatment' },
    { id: 3, src: '/templates/oris-detal/imgs/hc3.png', alt: 'Pediatric care' },
    { id: 4, src: '/templates/oris-detal/imgs/hc4.png', alt: 'Patient care session' },
]

export default function PassionMeetPurpose() {
    return (
        <section
            id="passion-meet-purpose"
            className="w-full bg-white oris-paddx mt-[-10vw] relative z-10 py-[7vw] flex flex-col items-center justify-center text-oris-secondary"
        >
            {/* Header */}
            <div className="flex flex-col items-center text-center mx-auto">
                <SplitTextLines as="h2" className="oris-text64 font-normal leading-[1.15]">
                    Passion Meet Purpose
                </SplitTextLines>
                <SplitTextLines as="p" className="oris-text22 text-oris-secondary/80 mt-[1.2vw] max-w-[36vw] max-md:max-w-full" delay={0.15}>
                    Behind every treatment is a team united by one goal: creating better experiences for every patient.
                </SplitTextLines>
            </div>

            {/* 4 Cards Row */}
            <div className="grid grid-cols-4 gap-[5vw] w-full mt-[5vw] max-md:grid-cols-2 max-sm:grid-cols-1 max-md:gap-4">
                {GALLERY_IMAGES.map((item) => (
                    <div
                        key={item.id}
                        className="w-full aspect-[3/4.2] relative rounded-[1vw] max-md:rounded-2xl overflow-hidden shadow-xs"
                    >
                        <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover hover:scale-105 transition-transform duration-500 ease-out"
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}

