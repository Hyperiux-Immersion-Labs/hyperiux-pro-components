import React from 'react'
import Button from '../Reusable/Button'
import Link from 'next/link'
import CircularButton from '../Reusable/CirclularButton'
import { socialLinks, socialLinksList, vaultLinks } from '../../utils/Links'
import LinkHover from '../Reusable/LinksHover'
import SplitLine from '../Reusable/SplitLine'
import ReflectiveRods from '@/Experience/ReflectiveRods'

export default function Footer() {
    return (
            <footer className='h-fit   z-200 relative w-full'>
                <ReflectiveRods />
                <div className='self-padd z-100 h-fit min-h-screen flex items-end justify-end relative'>
                    <div className='w-full h-fit relative'>

                        <SplitLine as="h2" className='text110 pointer-events-auto px-[10vw] text-center'>Build the interaction layer your website is missing.</SplitLine>
                        <div className='flex items-center py-[2vw] mb-[2vw] justify-center gap-[2vw]'>
                            <Button text="Install CLI" />
                            <Button text="Work with Hyperiux" variant="white" />
                        </div>
                        <div className='w-full h-fit flex items-end pb-[2vw] justify-between relative'>
                            <div className='w-fit flex-col gap-[1vw] flex items-start justify-center h-full'>
                                <div className='space-y-[.5vw]'>
                                    <LinkHover className='text22 block' href="/">
                                        hi@hyperiux.com
                                    </LinkHover>
                                    <LinkHover className='text22 block' href="/">
                                        +91817802636
                                    </LinkHover>
                                </div>
                                <div className="flex mt-4 gap-3">
                                    {socialLinks.map(({ href, Icon, label }) => (
                                        <CircularButton
                                            key={label}
                                            href={href}
                                            variant={undefined}
                                        >
                                            <Icon />
                                        </CircularButton>
                                    ))}
                                </div>
                            </div>
                            <div className='w-fit flex flex-row items-start justify-center gap-[4vw]'>
                                <div className="flex flex-col gap-[2.5vw]">
                                    <h3 className='text22 font-medium!'>Hyperiux Vault</h3>
                                    <ul className="flex flex-col gap-[.5vw]">
                                        {vaultLinks.map(({ label, href }) => (
                                            <li key={label}>
                                                <LinkHover
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text18"
                                                >
                                                    {label}
                                                </LinkHover>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-[2.5vw]">
                                    <h3 className='text22 font-medium!'>Socials</h3>
                                    <ul className="flex flex-col gap-[.5vw]">
                                        {socialLinksList.map(({ label, href }) => (
                                            <li key={label}>
                                                <LinkHover
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text18"
                                                >
                                                    {label}
                                                </LinkHover>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <p className='text18 text-center absolute bottom-[2vw] left-1/2 text-light-grey/60 -translate-x-1/2'>2026 Hyperiux Immersion Labs. All rights reserved</p>
                        </div>
                    </div>

                </div>
            </footer>

    )
}
