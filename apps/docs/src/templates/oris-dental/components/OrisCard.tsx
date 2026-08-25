'use client'

import React from 'react'
import Image from 'next/image'

const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
]

export default function OrisCard({
    title = "Join 5000+",
    subtitle = "Satisfied members",
    trustedText = "Trusted by 5,000+ happy patients",
    avatars = DEFAULT_AVATARS,
    className = ""
}) {
    return (
        <div className={`w-[30vw] h-[15vw] rounded-[2vw] bg-white p-[2.2vw] flex flex-col justify-between shadow-[0_15px_45px_rgba(0,0,0,0.06)] border border-white/60 relative z-10 ${className}`}>
            {/* Top Text Content */}
            <div>
                <h3 className="text-oris-secondary oris-text32 font-medium leading-none tracking-tight">
                    {title}
                </h3>
                <p className="text-oris-secondary oris-text22 font-normal">
                    {subtitle}
                </p>
            </div>

            {/* Bottom Content with Avatar Stack & Right Text */}
            <div className="flex items-center justify-between w-full">
                {/* Overlapping Avatar Stack */}
                <div className="flex items-center space-x-[-0.8vw]">
                    {avatars.map((src, idx) => (
                        <Image
                            key={idx}
                            src={src}
                            alt={`Patient avatar ${idx + 1}`}
                            width={80}
                            height={80}
                            className="w-[3.2vw] h-[3.2vw] rounded-full object-cover border-[0.18vw] border-white shadow-sm select-none"
                        />
                    ))}
                </div>

                {/* Right Text */}
                <div className="text-right text-oris-gray text-[0.95vw] font-normal leading-tight">
                    <p>Trusted by 5,000+</p>
                    <p>happy patients</p>
                </div>
            </div>
        </div>
    )
}
