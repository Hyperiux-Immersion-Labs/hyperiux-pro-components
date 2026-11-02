'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import SplitTextLines from './effects/split-text-lines/SplitTextLines'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

interface FAQEntry {
    question: string
    answer: string
}

const FAQS: FAQEntry[] = [
    {
        question: 'Do you accept dental insurance?',
        answer:
            'Yes. We work with most major dental insurance providers and will check your coverage before treatment begins, so you know exactly what is included and what you may need to pay.',
    },
    {
        question: 'How often should I come in for a check-up?',
        answer:
            'For most patients we recommend a check-up and professional cleaning every six months. If you have gum concerns or ongoing treatment, your dentist may suggest more frequent visits.',
    },
    {
        question: 'Is professional teeth whitening safe?',
        answer:
            'Yes. Our whitening treatments use clinically approved agents applied under supervision, protecting your enamel and gums while lifting stains for a brighter, natural-looking smile.',
    },
    {
        question: 'Do dental implants hurt?',
        answer:
            'Implant procedures are carried out under local anaesthesia, so you should feel little to no pain. Most patients describe mild soreness for a few days afterwards, which is easily managed.',
    },
    {
        question: 'Do you treat children?',
        answer:
            'Absolutely. Our pediatric team makes first visits relaxed and fun, and we recommend bringing children in by their first birthday or when their first tooth appears.',
    },
    {
        question: 'What should I do in a dental emergency?',
        answer:
            'Call us straight away. We keep same-day slots open for emergencies such as severe toothache, broken teeth or swelling, and will guide you on what to do until you arrive.',
    },
]

function FAQItem({
    item,
    index,
    isOpen,
    onToggle,
}: {
    item: FAQEntry
    index: number
    isOpen: boolean
    onToggle: () => void
}) {
    const id = `oris-faq-${index}`
    return (
        <div className="faq-item border-b border-[#13314a]/15">
            <h3>
                <button
                    type="button"
                    id={`${id}-button`}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-panel`}
                    onClick={onToggle}
                    className="group flex w-full items-center justify-between gap-[2vw] py-[1.6vw] max-lg:py-5 text-left cursor-pointer"
                >
                    <span
                        className={`text-[1.6vw] max-lg:text-[3.2vw] max-md:text-[4.6vw] leading-snug transition-colors duration-300 ${
                            isOpen ? 'text-oris-primary' : 'text-oris-secondary group-hover:text-oris-primary'
                        }`}
                    >
                        {item.question}
                    </span>
                    {/* Plus that turns into a minus as the answer opens */}
                    <span
                        aria-hidden="true"
                        className={`relative flex shrink-0 items-center justify-center size-[2.6vw] max-lg:size-10 max-md:size-9 rounded-full border transition-colors duration-300 ${
                            isOpen
                                ? 'bg-[#3365e2] border-[#3365e2] text-white'
                                : 'border-[#13314a]/20 text-oris-secondary group-hover:border-[#3365e2] group-hover:text-oris-primary'
                        }`}
                    >
                        <span className="absolute h-[1.5px] w-[38%] rounded-full bg-current" />
                        <span
                            className={`absolute h-[38%] w-[1.5px] rounded-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                                isOpen ? 'rotate-90 scale-y-0' : ''
                            }`}
                        />
                    </span>
                </button>
            </h3>
            <div
                id={`${id}-panel`}
                role="region"
                aria-labelledby={`${id}-button`}
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
            >
                <div className="overflow-hidden">
                    <p className="oris-text22 text-[#13314a]/75 leading-relaxed max-w-[44vw] max-lg:max-w-full pb-[1.8vw] max-lg:pb-6">
                        {item.answer}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function FAQ() {
    const sectionRef = useRef<HTMLElement | null>(null)
    const listRef = useRef<HTMLDivElement | null>(null)
    const [openIndex, setOpenIndex] = useState(0)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const items = listRef.current?.querySelectorAll('.faq-item')
            if (!items?.length) return
            gsap.set(items, { y: 40, opacity: 0 })
            gsap.to(items, {
                y: 0,
                opacity: 1,
                duration: 0.9,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: { trigger: listRef.current, start: 'top 85%', once: true },
            })
        }, sectionRef)
        return () => ctx.revert()
    }, [])

    return (
        <section
            id="faq"
            ref={sectionRef}
            className="w-full bg-white relative z-10 text-oris-secondary oris-paddx py-[7vw] max-lg:py-16 flex justify-between items-start gap-[6vw] max-lg:flex-col max-lg:gap-10"
        >
            <div className="w-[32vw] max-lg:w-full">
                <SplitTextLines as="h2" className="text-[4.2vw] max-lg:text-[6vw] max-md:text-[7.5vw] leading-[1.15]">
                    Questions? We have answers.
                </SplitTextLines>
                <SplitTextLines as="p" className="oris-text22 text-[#13314a]/80 mt-[1.2vw] max-lg:mt-3" delay={0.15}>
                    Everything you need to know before your visit. Can&apos;t find what you&apos;re looking for? Our
                    team is happy to help.
                </SplitTextLines>
            </div>
            <div ref={listRef} className="w-[55vw] max-lg:w-full border-t border-[#13314a]/15">
                {FAQS.map((item, i) => (
                    <FAQItem
                        key={item.question}
                        item={item}
                        index={i}
                        isOpen={openIndex === i}
                        onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                    />
                ))}
            </div>
        </section>
    )
}
