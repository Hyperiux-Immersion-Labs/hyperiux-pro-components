import HeadAnim from '@/components/Animations/HeadAnim'
import BorderBeam from '@/components/border-beam'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitLine from '@/components/WebsiteComps/SplitLine'
import { getDemoPageMetadata } from '@/lib/demo-metadata'

const propsData = [
  { label: 'size', value: '"md"' },
  { label: 'switch rotate', value: 'size = "sm" | "md" | "line"' },
  { label: 'switch pulse', value: 'size = "pulse-inner" | "pulse-outside"' },
  { label: 'colorVariant', value: '"colorful"' },
  { label: 'theme', value: '"dark"' },
  { label: 'strength', value: '1' },
]

export default function Page() {
  return (
    <>
      <DemoHeader logoColor="#000000" textColor="#000000" />

      <main className="min-h-screen overflow-hidden bg-white text-black">
        <section className="relative flex min-h-screen w-full items-center px-[6vw] pt-[6vw] max-md:px-[7vw] max-md:py-[12vw] max-sm:px-[6vw] max-sm:py-[16vw]">
          {/* <div className="absolute left-1/2 top-[16%] h-[30vw] w-[30vw] -translate-x-1/2 rounded-full bg-[#1d4ed8]/20 blur-[8vw] max-md:h-[54vw] max-md:w-[54vw] max-sm:h-[72vw] max-sm:w-[72vw]" />
          <div className="absolute right-[8vw] top-[24%] h-[18vw] w-[18vw] rounded-full bg-[#ff5a7a]/14 blur-[7vw] max-md:hidden" /> */}

          <div className="relative z-10 mx-auto grid w-full max-w-[88vw] grid-cols-[0.9fr_1.1fr] items-center gap-[5vw] max-md:max-w-full max-md:grid-cols-1 max-md:gap-[10vw]">
            <div className="max-w-[30vw] max-md:max-w-full">
              <p className="text-[0.8vw] uppercase tracking-[0.32em] text-black/45 max-md:text-[1.8vw] max-sm:text-[3vw]">
                Border Beam
              </p>

              <div className="mt-[1.2vw] max-sm:w-full max-md:w-[90%] max-md:mt-[2.8vw] max-sm:mt-[4vw]">
                <HeadAnim>
                  <h1 className="text-[4.5vw] font-semibold leading-none tracking-[-0.02em] text-black max-md:text-[7vw] max-sm:text-[10vw]">
                    One card. One beam. Clearer showcase.
                  </h1>
                </HeadAnim>
              </div>

              <div className="mt-[1.8vw] max-w-[28vw] max-md:mt-[4vw] max-md:max-w-full max-sm:mt-[5vw]">
                <SplitLine>
                  <p className="text-[1vw] leading-[1.6] text-black/62 max-md:text-[2.5vw] max-sm:text-[3.7vw]">
                    Border Beam wraps a surface with animated edge light, so you can shift between
                    a continuous rotating orbit and a softer pulse glow without changing the card
                    content itself.
                  </p>
                </SplitLine>
              </div>

              <div className="mt-[2vw] max-md:hidden max-w-[28vw] max-md:mt-[5vw] max-md:max-w-full max-sm:mt-[6vw]">
                <p className="text-[0.7vw] uppercase tracking-[0.2em] text-black/40 max-md:text-[1.5vw] max-sm:text-[2.5vw]">
                  Props
                </p>

                <div className="mt-[0.9vw] space-y-[0.4vw] max-md:mt-[2vw] max-md:space-y-[1vw] max-sm:mt-[3vw] max-sm:space-y-[1.6vw]">
                  {propsData.map((prop) => (
                    <p
                      key={prop.label}
                      className="font-mono text-[0.8vw] leading-normal text-black/68 max-md:text-[1.8vw] max-sm:text-[2.9vw]"
                    >
                      <span className="text-black">{prop.label}</span>
                      {' '}
                      <span className="text-black/45">:</span>
                      {' '}
                      <span className="text-[#1d4ed8]">
                        {prop.value}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative flex justify-end max-md:justify-center">
              <div className="absolute inset-x-[12%] top-[10%] h-[78%] rounded-[2vw] bg-black/4 blur-[5vw] max-md:inset-x-[5%] max-md:rounded-[8vw]" />
              <div className="relative w-full max-w-[42vw] max-md:max-w-full">
                <BorderBeam />
              </div>
            </div>
          </div>
        </section>
      </main>

     
    </>
  )
}

export async function generateMetadata() {
  return getDemoPageMetadata("border-beam");
}
