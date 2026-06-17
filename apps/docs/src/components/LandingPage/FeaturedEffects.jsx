'use client'
import { useEffect, useRef } from "react";
import Button from "../Reusable/Button";
import SplitLine from "../Reusable/SplitLine";
import RandomBlur from "../Reusable/RandomBlur";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedEffects() {
  const effect1 = useRef(null);
  const effect2 = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo([effect1.current, effect2.current], {
        xPercent: (index) => index === 0 ? -100 : 100,
      }, {
        xPercent: 0,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: '#FeaturedEffects',
          start: "top 80%",
          end: "85% 80%",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="FeaturedEffects"
      className="h-fit bg-background my-[10vw] max-md:mt-[40vw] gap-[2vw] max-md:gap-[8vw] flex-col w-full self-padd flex items-center justify-center overflow-x-hidden"
    >
      <p className="text22 text-light-grey">Featured Effects</p>

      <RandomBlur as="h2" className="text140 max-md:w-[70vw] text-center w-[80vw]">
        Start with the effects people actually notice.
      </RandomBlur>
      <SplitLine delay={0.3} as="p" className="text34 text-center mt-[4vw] w-[80vw]">
        A few high-impact patterns from the Vault - ready to preview, copy,
        install, and adapt.
      </SplitLine>

      <div className="w-full max-md:flex-col-reverse flex max-md:gap-[6vw] max-md:mt-[10vw] gap-[2.5vw] items-end mt-[4vw] flex-col ">
        <div className="w-fit max-md:mx-auto! max-md:mt-[6vw]">
          <Button text="Explore All Effects" href="/effects" />
        </div>
        <div className="w-full max-md:flex-col max-md:gap-[8vw] flex h-[50vh] max-sm:h-[50vh] max-md:h-[80vh] items-center gap-[2vw] justify-between">
          <div
            ref={effect1}
            className="w-full h-full rounded-md overflow-hidden bg-[#151515] border border-white/10"
          >
            <iframe
              src="https://v8468r-3000.csb.app/"
              data-sentry-block
              style={{ width: "100%", height: "100%", border: "0", borderRadius: "4px", overflow: "hidden" }}
              title="Image-Trail-1"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          </div>
          <div
            ref={effect2}
            className="w-full h-full rounded-md overflow-hidden bg-[#151515] border border-white/10"
          >
            <iframe
              src="https://v8468r-3000.csb.app/card-stack"
              data-sentry-block
              style={{ width: "100%", height: "100%", border: "0", borderRadius: "4px", overflow: "hidden" }}
              title="Image-Trail-2"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
