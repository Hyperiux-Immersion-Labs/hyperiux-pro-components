"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CharStaggerPrimaryButton = ({
    btnText = "",
    href = "#",
    btnClassName = "",
    textClassName = "",
    linkProps = {},
    children,
    staggerStep = 0.01,
    lineClassName = "",
    hoverColor = "",
    showArrow = false,
    icon: Icon = ArrowRight,
    iconClassName = "",
    bgClassName = "",
    onClick,
    ...props
}) => {
    const linkRef = useRef(null);
    const [isTouchHovered, setIsTouchHovered] = useState(false);
    const [supportsTouchHover, setSupportsTouchHover] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const sourceText = typeof children === "string" ? children : btnText;

    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
        const updateTouchSupport = () => {
            setSupportsTouchHover(mediaQuery.matches);
        };

        updateTouchSupport();
        mediaQuery.addEventListener("change", updateTouchSupport);

        return () => {
            mediaQuery.removeEventListener("change", updateTouchSupport);
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updateReducedMotion = () => {
            setPrefersReducedMotion(mediaQuery.matches);
        };

        updateReducedMotion();
        mediaQuery.addEventListener("change", updateReducedMotion);

        return () => {
            mediaQuery.removeEventListener("change", updateReducedMotion);
        };
    }, []);

    useEffect(() => {
        if (!isTouchHovered) return undefined;

        const handlePointerDown = (event) => {
            if (linkRef.current?.contains(event.target)) return;
            setIsTouchHovered(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [isTouchHovered]);

    const handleClick = (event) => {
        if (supportsTouchHover && !isTouchHovered) {
            event.preventDefault();
            setIsTouchHovered(true);
            return;
        }

        onClick?.(event);
    };

    const hoverStateClass =
        !prefersReducedMotion && isTouchHovered ? "text-[var(--char-hover-color)]" : "";
    const bgHoverClass = !prefersReducedMotion && isTouchHovered ? "scale-[0.95]" : "";
    const iconHoverClass = !prefersReducedMotion && isTouchHovered ? "translate-x-[5%]" : "";

    return (
        <Link
            ref={linkRef}
            href={href}
            {...linkProps}
            {...props}
            onClick={handleClick}
            className={`group relative inline-flex h-[4.2vw] items-center justify-center gap-2 px-10 py-3 text-inherit no-underline transition-colors duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] motion-reduce:transition-none motion-safe:hover:text-(--char-hover-color) motion-safe:focus-visible:text-(--char-hover-color) bg-[#ff5f00] max-xl:h-[9vw] max-xl:text-[3vw] max-xl:font-normal max-xl:motion-reduce:transition-none max-md:h-[15vw] max-md:text-[4.2vw] max-md:motion-reduce:transition-none ${hoverStateClass} ${btnClassName}`}
            style={{ "--char-hover-color": hoverColor }}
        >
            <div className="relative z-2">
                <span
                    className="relative  flex items-center justify-center"
                >
                    <span
                        className={`relative inline-block overflow-hidden leading-[1.2] ${textClassName}`}
                    >
                        {[...sourceText].map((char, index) => (
                            <span
                                key={`${char}-${index}`}
                                className="relative inline-block translate-y-0 rotate-[0.001deg] transition-transform duration-600 ease-[cubic-bezier(0.625,0.05,0,1)] will-change-transform motion-reduce:transition-none motion-safe:group-hover:translate-y-[-1.3em] motion-safe:group-focus-visible:translate-y-[-1.3em]"
                                style={{
                                    transitionDelay: prefersReducedMotion ? "0s" : `${index * staggerStep}s`,
                                    transform:
                                        isTouchHovered && !prefersReducedMotion
                                            ? "translateY(-1.3em) rotate(0.001deg)"
                                            : undefined,
                                    textShadow: "0px 1.3em currentColor",
                                    whiteSpace: char === " " ? "pre" : "normal",
                                }}
                            >
                                {char}
                            </span>
                        ))}
                    </span>
                </span>
            </div>
            <div className={`absolute h-full w-full duration-500 motion-reduce:transition-none motion-safe:group-hover:scale-[0.95] motion-safe:group-focus-visible:scale-[0.95] ${bgHoverClass} ${bgClassName}`} />


            {showArrow && Icon && (
                <div className={`flex items-center justify-start overflow-hidden ${iconClassName}`}>
                    <div className={`flex w-max -translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] will-change-transform motion-reduce:transition-none motion-safe:group-hover:translate-x-[5%] motion-safe:group-focus-visible:translate-x-[5%] ${iconHoverClass} ${iconClassName}`}>
                        <Icon className="h-full w-full flex-none" />
                        <Icon className="h-full w-full flex-none" />
                    </div>
                </div>
            )}
        </Link>
    );
};

export default CharStaggerPrimaryButton;
