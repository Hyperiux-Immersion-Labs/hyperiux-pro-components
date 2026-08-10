// Built using Hyperiux Vault: https://vault.hyperiux.com

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const LINK_LINE_CLASSES =
  "relative w-fit after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:block after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-out hover:after:origin-left hover:after:scale-x-100"

export interface NavLinkItem {
  href: string
  text: string
  liClassName?: string
}

export interface SocialLinkItem {
  href: string
  text: string
}

interface MenuLinkProps {
  href: string
  text: string
  className?: string
}

const MenuLink = ({ href, text, className = '' }: MenuLinkProps) => {
  return (
    <Link aria-hidden href={href} className={`block w-fit font-medium leading-[1.2] ${className}`} prefetch={false}>
      <span className={`${LINK_LINE_CLASSES} block`}>{text}</span>
    </Link>
  )
}

const NAV_LINKS: NavLinkItem[] = [
  { href: '/', text: 'Home', liClassName: 'overflow-hidden max-[1025px]:mb-[2vw] mb-[1vw]' },
  { href: '/effects', text: 'Effects', liClassName: 'overflow-hidden max-[1025px]:mb-[2vw] mb-[1vw]' },
  { href: '/pricing', text: 'Pricing', liClassName: 'overflow-hidden max-[1025px]:mb-[2vw] mb-[1vw]' },
  { href: '/docs', text: 'Docs', liClassName: 'overflow-hidden max-[1025px]:mb-[2vw] mb-[1vw]' },
]

const SOCIAL_LINKS: SocialLinkItem[] = [
  { href: 'https://x.com/_hyperiux_', text: 'Twitter / X' },
  { href: 'https://www.linkedin.com/company/hyperiux/', text: 'LinkedIn' },
  { href: 'https://github.com/Hyperiux-Immersion-Labs/hyperiux-components', text: 'GitHub' },
  { href: 'https://www.instagram.com/_hyperiux_/', text: 'Instagram' },
]

const SocialLink = ({ href, text }: SocialLinkItem) => (
  <li className='overflow-hidden'>
    <Link className='social-link group flex items-center gap-[3px] max-md:gap-[2.5vw]' target='_blank' href={href}>
      <span className={LINK_LINE_CLASSES}>{text}</span>
      <svg className='relative h-[1vw] w-[1vw] -rotate-[135deg] overflow-hidden max-[1025px]:h-[3vw] max-[1025px]:w-[3vw] max-md:h-[6vw] max-md:w-[6vw]' width='19' height='23' viewBox='0 0 19 23' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path className='origin-center -translate-y-[110%] scale-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:scale-100' d='M9.44186 23C9.38605 22.9324 9.33953 22.8559 9.27442 22.7973C6.25116 19.8649 3.22791 16.9369 0.204652 14.009C0.139535 13.9459 0.0604662 13.8964 1.30208e-06 13.8468C0.576745 13.2973 1.12558 12.7748 1.66512 12.2613C3.82326 14.3514 6.01861 16.4775 8.2093 18.6036C8.23256 18.5901 8.26047 18.5811 8.28372 18.5676C8.28372 12.3829 8.28372 6.19369 8.28372 -4.68423e-07C9.09768 -4.32844e-07 9.87442 -3.98892e-07 10.6744 -3.63923e-07C10.6744 6.19369 10.6744 12.3784 10.6744 18.5901C12.893 16.4369 15.0884 14.3108 17.2651 12.2027C17.8465 12.7568 18.3907 13.2838 19 13.8739C18.9488 13.9009 18.8558 13.9324 18.7907 13.9955C15.7581 16.9279 12.7302 19.8649 9.70233 22.7973C9.64186 22.8559 9.5907 22.9324 9.53488 23C9.50698 23 9.47442 23 9.44186 23Z' fill='currentColor' />
        <path className='origin-center transition-all duration-500 ease-out group-hover:translate-y-[110%] group-hover:scale-0' d='M9.44186 23C9.38605 22.9324 9.33953 22.8559 9.27442 22.7973C6.25116 19.8649 3.22791 16.9369 0.204652 14.009C0.139535 13.9459 0.0604662 13.8964 1.30208e-06 13.8468C0.576745 13.2973 1.12558 12.7748 1.66512 12.2613C3.82326 14.3514 6.01861 16.4775 8.2093 18.6036C8.23256 18.5901 8.26047 18.5811 8.28372 18.5676C8.28372 12.3829 8.28372 6.19369 8.28372 -4.68423e-07C9.09768 -4.32844e-07 9.87442 -3.98892e-07 10.6744 -3.63923e-07C10.6744 6.19369 10.6744 12.3784 10.6744 18.5901C12.893 16.4369 15.0884 14.3108 17.2651 12.2027C17.8465 12.7568 18.3907 13.2838 19 13.8739C18.9488 13.9009 18.8558 13.9324 18.7907 13.9955C15.7581 16.9279 12.7302 19.8649 9.70233 22.7973C9.64186 22.8559 9.5907 22.9324 9.53488 23C9.50698 23 9.47442 23 9.44186 23Z' fill='currentColor' />
      </svg>
    </Link>
  </li>
)

interface MenuProps {
  menuOpen: boolean
  navLinks?: NavLinkItem[]
  socialLinks?: SocialLinkItem[]
  panelWidth?: string
}

export default function Menu({
  menuOpen,
  navLinks = NAV_LINKS,
  socialLinks = SOCIAL_LINKS,
  panelWidth = '50%',
}: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const [serviceOpen, setServiceOpen] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const links = document.querySelectorAll('.link-anim')
    const socialLinksEls = document.querySelectorAll('.social-link')

    if (menuOpen) {
      const tl = gsap.timeline().to(navRef.current, {
        left: 0,
        x: 0,
        duration: reduceMotion ? 0.3 : 0.5,
        ease: 'power3.out',
      })

      if (reduceMotion) {
        tl.from(links, {
          opacity: 0,
          duration: 0.3,
          ease: 'power1.out',
        }).from(socialLinksEls, {
          opacity: 0,
          duration: 0.3,
          ease: 'power1.out',
        })
      } else {
        tl.from(links, {
          yPercent: 100,
          duration: 1,
          delay: -0.4,
          ease: 'power3.out',
          stagger: 0.05,
        }).from(socialLinksEls, {
          rotationZ: 5,
          yPercent: 100,
          duration: 1,
          delay: -1,
          stagger: 0.05,
          ease: 'power3.out',
        })
      }
    } else {
      gsap.timeline().to(navRef.current, {
        left: '99px',
        x: '100%',
        duration: reduceMotion ? 0.3 : 0.5,
        ease: 'power3.out',
        onComplete: () => {
          setServiceOpen(false)
        },
      })
    }
  }, [menuOpen])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const serviceLinks = document.querySelectorAll('.service-links li')

    if (serviceOpen) {
      gsap.to(serviceLinks, {
        opacity: 1,
        x: 0,
        duration: reduceMotion ? 0.2 : 0.5,
        stagger: reduceMotion ? 0 : 0.05,
      })
    } else {
      gsap.to(serviceLinks, {
        opacity: 0,
        x: reduceMotion ? 0 : 50,
        duration: reduceMotion ? 0.2 : 0.5,
        stagger: reduceMotion
          ? 0
          : {
              each: 0.02,
              from: 'end',
            },
      })
    }
  }, [serviceOpen])

  return (
    <div ref={menuRef} className='pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-[199] flex items-start justify-end'>
      <nav
        ref={navRef}
        style={{ '--panel-width': panelWidth } as CSSProperties}
        className='relative left-[99px] h-full w-(--panel-width) translate-x-[100%] pointer-events-auto bg-black/20 backdrop-blur-md max-[1025px]:w-[70%] max-md:w-full'
      >
        <div data-lenis-prevent className='relative flex h-full w-full flex-col items-start justify-between overflow-y-auto px-[5vw] pb-[3.5vw] pt-[5.5vw] max-[1025px]:justify-between max-[1025px]:py-[15vw] max-md:pb-[10vw] max-md:pt-[25vw]'>
          <ul className='font-display text-[4vw] leading-[1.15] text-white max-[1025px]:text-[6.5vw] max-md:text-[11.5vw]'>
            {navLinks.map((link) => (
              <li key={link.text} className={link.liClassName}>
                <MenuLink className='link-anim' href={link.href} text={link.text} />
              </li>
            ))}
          </ul>

          <div className='my-[6vw] hidden h-[1px] w-full bg-white py-[0.1vw] max-md:block'></div>

          <div className='flex flex-col space-y-[0.5vw] text-[1.1vw] font-medium text-white max-[1025px]:text-[3vw] max-md:mb-[7vw] max-md:text-[5vw]'>
            <div className='w-fit overflow-hidden'>
              <MenuLink className='link-anim' href='mailto:hello@hyperiux.com' text='hello@hyperiux.com' />
            </div>
          </div>

          <ul className='flex w-[90%] items-center justify-between text-[1vw] font-medium uppercase text-white max-[1025px]:flex-wrap max-[1025px]:items-start max-[1025px]:gap-[2vw] max-[1025px]:text-[3vw] max-md:flex-col max-md:items-start max-md:gap-[1.5vw] max-md:text-[4.5vw]'>
            {socialLinks.map((link) => (
              <SocialLink key={link.text} href={link.href} text={link.text} />
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}
