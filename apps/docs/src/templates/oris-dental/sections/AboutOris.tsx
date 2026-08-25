import React from 'react'

const STATS = [
  {
    number: "15+",
    label: "Years of Trusted Dental Practice"
  },
  {
    number: "30+",
    label: "Available Treatment Options Offered"
  },
  {
    number: "98%",
    label: "Patient Satisfaction Rating Overall"
  },
  {
    number: "8",
    label: "Experienced Dental Professionals"
  }
]

export default function AboutOris() {
  return (
    <section id='about-oris' className='min-h-screen w-full relative z-10 bg-white oris-paddx flex flex-col justify-between py-[6vw]'>
      {/* Top Section: Subtitle Tag on Left, Main Heading on Right */}
      <div className="flex justify-between items-start w-full">
        {/* Left Subtitle Tag */}
        <div className="flex items-center gap-[0.5vw] text-oris-secondary oris-text22 font-normal">
          <span className="inline-block w-[0.45vw] h-[0.45vw] rounded-full bg-oris-secondary"></span>
          <span>Who are we?</span>
        </div>

        {/* Right Main Heading */}
        <div className="w-[60vw]">
          <h2 className="oris-text64 text-oris-secondary  leading-[1.2] font-normal">
            At Oris Dental, we believe everyone deserves a confident smile. Our skilled team offers personalized care using modern techniques and a gentle approach.
          </h2>
        </div>
      </div>

      {/* Bottom Section: 4 Stat Columns */}
      <div className="grid grid-cols-4 gap-[7vw] w-full pt-[8vw]">
        {STATS.map((stat, idx) => (
          <div key={idx} className="flex flex-col shrink-0">
            <span className="oris-text64 font-normal! text-oris-secondary leading-none">
              {stat.number}
            </span>
            <p className="oris-text22 text-oris-secondary mt-[1.2vw] max-w-[22vw] leading-snug">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
