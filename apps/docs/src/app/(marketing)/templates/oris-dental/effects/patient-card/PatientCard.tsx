'use client'

import React from 'react'

const DEFAULT_PATIENTS = [
    {
        name: 'Sarah Jenkins',
        src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
        name: 'David Chen',
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
        name: 'Elena Rostova',
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
    {
        name: 'Marcus Brody',
        src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    },
    {
        name: 'Chloe Bennett',
        src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
]

export default function PatientCard({
    title = "Join 5000+",
    subtitle = "Satisfied members",
    trustedText = "Trusted by 5,000+ happy patients",
    avatars = DEFAULT_PATIENTS,
    className = ""
}: {
    title?: string
    subtitle?: string
    trustedText?: string
    avatars?: (string | { name: string; src: string })[]
    className?: string
}) {
    return (
        <div className={`w-[30vw] max-[1025px]:w-full h-fit rounded-[2vw] bg-white p-[2.2vw] max-[1025px]:p-4 max-md:p-5 flex flex-col max-[1025px]:flex-row! justify-between border border-white/60 relative z-10 ${className}`}>
            {/* Top Text Content */}
            <div className='mb-[2vw] max-[1025px]:mb-3'>
                <h3 className="text-oris-secondary oris-text32 font-medium leading-none tracking-tight">
                    {title}
                </h3>
                <p className="text-oris-secondary oris-text22 font-normal mt-0.5">
                    {subtitle}
                </p>
            </div>

            {/* Bottom Content with Avatar Stack & Right Text */}
            <div className="flex items-center max-md:justify-end max-md:w-fit justify-between w-full">
                {/* Overlapping Avatar Stack */}
                <div className="flex items-center space-x-[-0.8vw] max-[1025px]:space-x-[-8px]">
                    {avatars.map((item, idx) => {
                        const name = typeof item === 'string' ? `Patient ${idx + 1}` : item.name
                        const src = typeof item === 'string' ? item : item.src

                        return (
                            <div key={idx} className="relative group/avatar z-10 hover:z-30">
                                <img
                                    src={src}
                                    alt={name}
                                    className="w-[3.2vw] h-[3.2vw] max-[1025px]:w-10 max-[1025px]:h-10  rounded-full object-cover border-[0.18vw] max-[1025px]:border-2 border-white shadow-sm select-none relative transition-all duration-300 ease-out group-hover/avatar:scale-115 group-hover/avatar:shadow-md cursor-pointer"
                                />

                                {/* Bottom Tooltip */}
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 -translate-y-1 group-hover/avatar:opacity-100 group-hover/avatar:translate-y-0 pointer-events-none transition-all duration-200 ease-out z-40 whitespace-nowrap bg-[#13314a] text-white text-[0.7vw] max-[1025px]:text-[11px] max-md:text-[10px] font-medium py-1 px-2.5 rounded-md shadow-lg shadow-black/20 flex flex-col items-center">
                                    {/* Tooltip arrow pointing up */}
                                    <div className="absolute top-[-.2vw] max-[1025px]:-top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#13314a] rotate-45" />
                                    <span>{name}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Right Text */}
                <div className="text-right max-md:hidden text-oris-gray text-[0.95vw] max-[1025px]:text-xs font-normal leading-tight">
                    <p>Trusted by 5,000+</p>
                    <p>happy patients</p>
                </div>
            </div>
        </div>
    )
}
