"use client";
import Image from "next/image";
import Link from "next/link";

import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useRef } from "react";
gsap.registerPlugin(ScrollTrigger);
import Footerbg from "./assets/footer-bg.svg";
import ElenaVossLogo from "./assets/elena-voss.svg";
import FacebookIcon from "./assets/facebook.svg";
import InstagramIcon from "./assets/instagram.svg";
import LinkedInIcon from "./assets/linkedIn.svg";
import TwitterIcon from "./assets/twitter.svg";
import DotFillBtn from "./effects/dot-fill-button/DotFillButton";

const SocialLinks = [
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "LinkedIn", href: "#", icon: LinkedInIcon },
  { label: "Twitter", href: "#", icon: TwitterIcon },
];

const Footer = () => {
  const footerRef = useRef(null);
  const footerGlassRef = useRef(null);
  // useEffect(()=>{
  //     gsap.from(footerGlassRef.current,{
  //         // scale:1.1,
  //         opacity:0,
  //         yPercent:40,
  //         ease:"power3.out",
  //         scrollTrigger:{
  //             trigger: footerRef.current,
  //             start: "top 60%",
  //             end:"bottom 60%",
  //             scrub: 0.25,
  //         }
  //     })
  // })

  return (
    <>
      <footer
        className="relative overflow-hidden px-[4vw] pt-[10vw] max-md:px-4 max-md:pt-[20vw]"
        id="footer"
        ref={footerRef}
      >
        <Image
          src={Footerbg}
          width={1920}
          height={900}
          alt="Footer Background"
          loading="lazy"
          className="absolute -bottom-20 left-0 right-0 w-full max-md:scale-[5] max-md:bottom-0"
        />
        <div className="relative z-[1]">
          <div
            className="rounded-4xl bg-black/5 border border-white/30 backdrop-blur-2xl px-12 py-12 flex justify-between max-[1025px]:flex-col-reverse max-[1025px]:gap-10 max-[1025px]:px-8 max-[1025px]:py-10 max-md:px-6 max-md:py-8 max-md:gap-8"
            ref={footerGlassRef}
          >
            {/* Logo and Contact Info */}

            <div className="flex flex-col justify-between items-start gap-24 footer-content max-[1025px]:gap-10 max-md:gap-8">
              <Image
                src={ElenaVossLogo}
                width={338}
                height={172}
                alt="Logo"
                loading="lazy"
                className="w-[22vw] max-[1025px]:w-[34vw] max-md:w-[46vw]"
              />
              <div className=" text-foreground">
                <h6 className="uppercase mb-5 text-[1.25vw] max-[1025px]:text-[2.4vw] max-md:text-[4vw]">Reach Out</h6>
                <ul className="space-y-2 text-[1.25vw] max-[1025px]:text-[2.4vw] max-md:text-[4vw]">
                  <li className="under-multi-parent">
                    <a
                      href="tel:+1 (415) 309-8274"
                      className="under-multi content-p"
                    >
                      +1 (415) 309-8274
                    </a>
                  </li>

                  <li className="under-multi-parent">
                    <a
                      href="mailto:hello@elenavoss.design"
                      className="under-multi content-p"
                    >
                      hello@elenavoss.design
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between gap-36 h-auto w-1/2 ml-auto  footer-content max-[1025px]:w-full max-[1025px]:items-start max-[1025px]:gap-10 max-md:items-start max-md:gap-16 ">
            
            <div className="flex flex-col gap-[2vw] items-end max-[1025px]:items-start max-md:items-start max-md:gap-[7vw]">
              <p className="text-[3.4vw] text-end w-[75%] leading-[1.15] max-[1025px]:text-[5vw] max-[1025px]:w-full max-[1025px]:text-start max-md:text-[7.5vw] max-md:w-full max-md:text-start">
                Ready to Bring Your Vision to Life?
              </p>
              <DotFillBtn btnText="Get in Touch" href={"#"} textClassName="font-normal text-[1.15vw] max-[1025px]:text-[3vw] max-md:text-[4.2vw]" bgColor="#ffffff" dotColor="#ff5f00" hoverTextColor="#ffffff" textColor="#111111"/>

            </div>

              <div className="flex flex-col justify-between h-fit">
                {/* Social Media Links */}
                <ul className="flex gap-4">
                  {SocialLinks.map((link, index) => (
                    <li key={index} className="group">
                      <Link
                        href={link.href}
                        aria-label={link.label}
                        className="rounded-full  block p-2.5 border overflow-hidden bg-white/5  group-hover:bg-white transition-all duration-500 ease group-hover:scale-[0.95]"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Image
                            src={link.icon}
                            alt={link.label}
                            className="w-full h-full object-contain group-hover:invert transition-all duration-500 ease"
                          />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-between py-8 pt-12 text-lg text-foreground max-md:flex-col max-md:gap-2 max-md:text-sm max-md:text-center max-md:py-6 max-md:pt-8">
            <p>Copyright © Elena Voss Design 2025</p>
            <p>
              By: <a href="https://www.hyperiux.com/">Hyperiux</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
