"use client"

import { useState } from 'react'
import { ReactLenis } from 'lenis/react'
import Image from 'next/image'
import SlideTextReveal from '@/components/slide-text-reveal'

const SlideTextWrapper = () => {
  const [replayKey, setReplayKey] = useState(0)

  return (
    <>
    <ReactLenis root key={replayKey}>
      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden bg-[#080808]">
        <Image
          src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-04.jpg"
          alt="asset-image"
          fill
          priority
          className="object-cover opacity-45"
        />

        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/55 to-black" />
        <div className="absolute -top-40 left-1/2 h-175 w-175 -translate-x-1/2 rounded-full bg-[#ff5f99]/20 blur-3xl" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 text-center">
         

          <button
            type="button"
            onClick={() => setReplayKey((value) => value + 1)}
            className="mb-8 cursor-pointer rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white backdrop-blur-xl transition hover:bg-white/16"
          >
            Replay animation
          </button>

          <SlideTextReveal
            key={`hero-title-${replayKey}`}
            animateOnScroll={false}
            className="text-center"
          >
            <h1 className="text-8xl max-[1025px]:text-6xl font-black leading-[0.92] tracking-tight text-white">
              Slide From Right
            </h1>
          </SlideTextReveal>

          <SlideTextReveal
            key={`hero-copy-${replayKey}`}
            animateOnScroll={false}
            delay={0.2}
          >
            <p className="mt-8 max-w-2xl text-2xl max-[1025px]:text-lg text-white/65">
              A cinematic text reveal where every character enters with
              intention.
            </p>
          </SlideTextReveal>
        </div>
      </section>

      {/* Showcase */}
      <section className="relative min-h-screen overflow-hidden bg-[#f7f2ff] ">
        <Image
          src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-05.jpg"
          alt="asset-image"
          fill
          className="object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
          <div className="max-w-6xl">
            <div className="my-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-sm uppercase tracking-[0.35em] text-black/40">
                Directional Motion
              </span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <SlideTextReveal
              key={`showcase-copy-${replayKey}`}
          
              delay={0.15}
              className="max-w-5xl"
            >
              <p className="text-center text-6xl max-[1025px]:text-4xl font-semibold leading-[1.15] text-[#121212]">
                Characters gracefully slide in from the right
                <span className="text-[#c2185b]"> with elegant stagger</span>,
                creating a premium reveal that feels alive while scrolling.
              </p>
            </SlideTextReveal>

            <div className="mt-20 grid grid-cols-4 gap-6 max-[1025px]:grid-cols-2 max-md:mb-10">
              {[
                'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-06.jpg',
                'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-07.jpg',
                'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-08.jpg',
                'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-09.jpg',
              ].map((src, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-[30px] border border-black/10 bg-white/50 backdrop-blur-xl"
                >
                  <div className="relative h-60">
                    <Image
                      src={src}
                      alt="asset-image"
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final */}
      <section className="relative min-h-screen overflow-hidden bg-black">
        <Image
          src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-10.jpg"
          alt="asset-image"
          fill
          className="object-cover opacity-45"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-8">
          <div className="relative max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-8 py-24 backdrop-blur-2xl">
            <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />

            <SlideTextReveal
              key={`final-title-${replayKey}`}
     
              delay={0.1}
              className="relative text-center"
            >
              <h2 className="text-8xl max-[1025px]:text-5xl font-black leading-[0.95] text-white">
                Perfect for
                <br />
                guiding attention
                <br />
                through motion
              </h2>
            </SlideTextReveal>

            <SlideTextReveal
              key={`final-copy-${replayKey}`}
              start='top 90%'
              end='bottom 75%'
              delay={0.3}
            >
              <p className="relative mx-auto mt-10 max-w-2xl text-center text-lg text-white/60">
                Designed to feel smooth, modern and intentionally cinematic.
              </p>
            </SlideTextReveal>
          </div>
        </div>
      </section>
    </ReactLenis>
    </>
  )
}

export default SlideTextWrapper
