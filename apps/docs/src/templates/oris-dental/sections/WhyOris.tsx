import Image from 'next/image'
import React from 'react'
import OrisSlotCounter from '../components/OrisSlotCounter'
import SplitTextLines from '../components/SplitTextLines'

const WHY_STATS = [
    {
        number: '15+',
        label: 'Years of Experience',
    },
    {
        number: '30+',
        label: 'Dental Treatments',
    },
    {
        number: '8',
        label: 'Skilled Dentists',
    },
    {
        number: '98%',
        label: 'Patient Satisfaction',
    },
]

export default function WhyOris() {
    return (
        <section id="why-oris" className="min-h-screen oris-paddx py-[6vw] mt-[-6vw] w-full">
            <div className="h-full min-h-[85vh] rounded-[1.8vw] max-md:rounded-2xl overflow-hidden mx-auto w-[90%] relative shadow-lg">
                <Image
                    alt="why-oris"
                    fill
                    src="/templates/oris-detal/imgs/oris-whyus.png"
                    className="h-full w-full absolute inset-0 object-cover"
                />

                {/* Subtle dark gradient overlay for optimal contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 pointer-events-none" />

                <div className="relative p-[4vw] text-white h-full min-h-[85vh] w-full flex flex-col items-start justify-between">
                    <div className="space-y-[1vw] max-w-[40vw] max-md:max-w-full">
                        <SplitTextLines as="h2" className="oris-text64 text-white leading-tight">
                            Why Choose Us
                        </SplitTextLines>
                        <SplitTextLines as="p" className="oris-text22 text-white/90" delay={0.15}>
                            Built where patient comfort meets expertise.
                        </SplitTextLines>
                    </div>

                    {/* 4 Counter Columns with Divider Lines */}
                    <div className="grid grid-cols-4 gap-[4vw] w-full max-md:grid-cols-2 max-md:gap-6 pt-[4vw]">
                        {WHY_STATS.map((stat, idx) => (
                            <div key={idx} className="flex flex-col">
                                <OrisSlotCounter
                                    value={stat.number}
                                    className="oris-text64 font-normal text-white leading-none tracking-tight"
                                    baseDelay={idx * 0.12}
                                    duration={1.6}
                                />
                                <div className="w-full h-[1px] bg-white/44 my-[1vw] max-md:my-2.5" />
                                <SplitTextLines
                                    as="p"
                                    className="text-white/80 text-[1.1vw] max-md:text-sm font-normal leading-snug"
                                    delay={idx * 0.06}
                                >
                                    {stat.label}
                                </SplitTextLines>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
