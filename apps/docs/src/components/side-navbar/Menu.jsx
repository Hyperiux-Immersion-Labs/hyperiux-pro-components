import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// Underline that grows in from the right on hover, and retreats back out to
// the right (not just fading in place) when the hover ends - the origin
// flips between right/left so scale-x animates from/to the same edge.
const LINK_LINE_CLASSES =
  "relative w-fit after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:block after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-out hover:after:origin-left hover:after:scale-x-100";

const MenuLink = ({ href, text, className = "" }) => {
  return (
    <Link aria-hidden href={href} className={`block w-fit leading-[1.2] font-medium ${className}`} prefetch={false}>
      <span className={`${LINK_LINE_CLASSES} block`}>{text}</span>
    </Link>
  )
}

const NAV_LINKS = [
  { href: "/", text: "Home", liClassName: "overflow-hidden max-[1025px]:mb-[2vw] mb-[1vw]" },
  { href: "#", text: "About", liClassName: "overflow-hidden max-[1025px]:mb-[2vw] mb-[1vw]" },
  { href: "/effects", text: "Effects", liClassName: "overflow-hidden max-[1025px]:mb-[2vw] mb-[1vw]" },
  { href: "/pricing", text: "Pricing", liClassName: "overflow-hidden max-[1025px]:mb-[2vw] mb-[1vw]" },

];

const SOCIAL_LINKS = [
  { href: "#", text: "Linkedin" },
  { href: "#", text: "Instagram" },
  { href: "#", text: "behance" },
  { href: "#", text: "Pinterest" },
];

const SocialLink = ({ href, text }) => (
  <li className="overflow-hidden">
    <Link
      className="social-link flex items-center gap-[3px] max-md:gap-[2.5vw] group" target="_blank" href={href}>
      <span className={LINK_LINE_CLASSES}>
        {text}
      </span>
      <svg className="relative -rotate-[135deg] w-[1vw] h-[1vw] overflow-hidden max-md:w-[6vw] max-md:h-[6vw] max-[1025px]:w-[3vw] max-[1025px]:h-[3vw]" width="19" height="23" viewBox="0 0 19 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path className="origin-center -translate-y-[110%] scale-0 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-500 ease-out" d="M9.44186 23C9.38605 22.9324 9.33953 22.8559 9.27442 22.7973C6.25116 19.8649 3.22791 16.9369 0.204652 14.009C0.139535 13.9459 0.0604662 13.8964 1.30208e-06 13.8468C0.576745 13.2973 1.12558 12.7748 1.66512 12.2613C3.82326 14.3514 6.01861 16.4775 8.2093 18.6036C8.23256 18.5901 8.26047 18.5811 8.28372 18.5676C8.28372 12.3829 8.28372 6.19369 8.28372 -4.68423e-07C9.09768 -4.32844e-07 9.87442 -3.98892e-07 10.6744 -3.63923e-07C10.6744 6.19369 10.6744 12.3784 10.6744 18.5901C12.893 16.4369 15.0884 14.3108 17.2651 12.2027C17.8465 12.7568 18.3907 13.2838 19 13.8739C18.9488 13.9009 18.8558 13.9324 18.7907 13.9955C15.7581 16.9279 12.7302 19.8649 9.70233 22.7973C9.64186 22.8559 9.5907 22.9324 9.53488 23C9.50698 23 9.47442 23 9.44186 23Z" fill="currentColor" />
        <path className="origin-center group-hover:scale-0 group-hover:translate-y-[110%] transition-all duration-500 ease-out" d="M9.44186 23C9.38605 22.9324 9.33953 22.8559 9.27442 22.7973C6.25116 19.8649 3.22791 16.9369 0.204652 14.009C0.139535 13.9459 0.0604662 13.8964 1.30208e-06 13.8468C0.576745 13.2973 1.12558 12.7748 1.66512 12.2613C3.82326 14.3514 6.01861 16.4775 8.2093 18.6036C8.23256 18.5901 8.26047 18.5811 8.28372 18.5676C8.28372 12.3829 8.28372 6.19369 8.28372 -4.68423e-07C9.09768 -4.32844e-07 9.87442 -3.98892e-07 10.6744 -3.63923e-07C10.6744 6.19369 10.6744 12.3784 10.6744 18.5901C12.893 16.4369 15.0884 14.3108 17.2651 12.2027C17.8465 12.7568 18.3907 13.2838 19 13.8739C18.9488 13.9009 18.8558 13.9324 18.7907 13.9955C15.7581 16.9279 12.7302 19.8649 9.70233 22.7973C9.64186 22.8559 9.5907 22.9324 9.53488 23C9.50698 23 9.47442 23 9.44186 23Z" fill="currentColor" />
      </svg>
    </Link>
  </li>
);

export default function Menu({ menuOpen }) {
  const menuRef = useRef(null);
  const navRef = useRef(null);
  const [serviceOpen, setServiceOpen] = useState(false);

  useEffect(() => {
    const links = document.querySelectorAll(".link-anim");
    const socialLinks = document.querySelectorAll(".social-link");

    if (menuOpen) {
      gsap.timeline()
        .to(navRef.current, {
          left: 0,
          x: 0,
          duration: 0.5,
          ease: "power3.out",
        })
        .from(links, {
          yPercent: 100,
          duration: 1,
          delay: -0.4,
          ease: "power3.out",
          stagger: 0.05
        })
        .from(socialLinks, {
          rotationZ: 5,
          yPercent: 100,
          duration: 1,
          delay: -1,
          stagger: 0.05,
          ease: "power3.out",
        })
    } else {
      gsap.timeline()
        .to(navRef.current, {
          left: "99px",
          x: '100%',
          duration: 0.5,
          ease: "power3.out",
          onComplete: () => {
            setServiceOpen(false);
          }
        });
    }
  }, [menuOpen]);


  useEffect(() => {
    const serviceLinks = document.querySelectorAll(".service-links li");
    if (serviceOpen) {
      gsap.to(serviceLinks, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.05,
      })
    } else {
      gsap.to(serviceLinks, {
        opacity: 0,
        x: 50,
        duration: 0.5,
        stagger: {
          each: 0.02, from: "end"
        }
      })
    }
  }, [serviceOpen]);

  return (
    <div ref={menuRef} className="fixed top-0 z-[199] left-0 right-0 bottom-0 flex items-start justify-end pointer-events-none">
      <nav ref={navRef} className={`relative w-[50%] pointer-events-auto translate-x-[100%] left-[99px] h-full bg-black/20 backdrop-blur-md max-md:w-full max-[1025px]:w-[70%]`}>
        <div data-lenis-prevent className="w-full h-full px-[5vw] pt-[5.5vw] pb-[3.5vw] relative flex flex-col justify-between items-start max-[1025px]:justify-between max-[1025px]:py-[15vw] max-md:pt-[25vw] max-md:pb-[10vw] overflow-y-auto">
          <ul className="text-[4vw] font-display text-white leading-[1.15] max-md:text-[11.5vw] max-[1025px]:text-[6.5vw]">
            {NAV_LINKS.map((link) => (
              <li key={link.text} className={link.liClassName}>
                <MenuLink className="link-anim" href={link.href} text={link.text} />
              </li>
            ))}
          </ul>
          <div className="w-full h-[1px] bg-white py-[0.1vw] my-[6vw] hidden max-md:block"></div>
          <div className="text-[1.1vw] font-medium text-white flex flex-col space-y-[0.5vw] max-md:text-[5vw] max-md:mb-[7vw] max-[1025px]:text-[3vw]">
            <div className="w-fit overflow-hidden">
              <MenuLink
                className="link-anim"
                href="mailto:hello@hyperiux.com"
                text="hello@hyperiux.com"
              />
            </div>

          </div>
          <ul className="flex justify-between items-center text-[1vw] text-white font-medium uppercase w-[90%] max-md:flex-col max-md:items-start max-md:text-[4.5vw] max-md:gap-[1.5vw] max-[1025px]:text-[3vw] max-[1025px]:flex-wrap max-[1025px]:items-start max-[1025px]:gap-[2vw]">
            {SOCIAL_LINKS.map((link) => (
              <SocialLink key={link.text} href={link.href} text={link.text} />
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
