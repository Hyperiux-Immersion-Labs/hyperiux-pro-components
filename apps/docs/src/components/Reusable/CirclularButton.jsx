'use client'
import React, { useRef } from 'react';
import Link from 'next/link';
// If SOCIAL_ICONS is from somewhere else, be sure to import that too, e.g.:
// import { SOCIAL_ICONS } from './path/to/icons';

export default function CircularButton({
    href = "/",
    variant,
    children,
    className = "",
    fill = "",
    menuSocial = false,
    bgColor,
    ...rest
}) {
    const spanRef = useRef(null);
    const Icon = variant ? SOCIAL_ICONS[variant] : null;

    const handleMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (spanRef.current) {
            spanRef.current.style.left = `${x}px`;
            spanRef.current.style.top = `${y}px`;
            spanRef.current.style.transform = "translate(-50%, -50%) scale(1)";
        }
    };

    const handleMouseLeave = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (spanRef.current) {
            spanRef.current.style.left = `${x}px`;
            spanRef.current.style.top = `${y}px`;
            spanRef.current.style.transform = "translate(-50%, -50%) scale(0)";
        }
    };

    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full overflow-hidden socials cursor-pointer relative border border-white w-fit h-fit group duration-500 ease-in-out flex items-center justify-center ${menuSocial ? "menusocials" : "hover:border-[#ff5f00]"
                }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...rest}
        >
            <span
                ref={spanRef}
                className="absolute aspect-square rounded-full pointer-events-none"
                style={{
                    width: "250%",
                    transform: "translate(-50%, -50%) scale(0)",
                    transition: "transform 0.5s ease",
                    backgroundColor: bgColor ?? (menuSocial ? "#ffffff" : "#ff5f00"),
                }}
            />
            <span className="relative z-2 flex items-center justify-center">
                {Icon ? <Icon className={className} fill={fill} /> : children}
            </span>
        </Link>
    );
}