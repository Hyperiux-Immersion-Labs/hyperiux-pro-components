"use client";

import { useEffect, useRef, useState } from"react";

const MOBILE_BREAKPOINT = 640;
const MOBILE_HOLD_MS = 1000;
const DEFAULT_HREF = "#";

const DotFillBtn = ({
 btnText ="",
 href = DEFAULT_HREF,
 className ="",
 textClassName ="",
 staggerStep = 0.01,
 bgColor ="#ff6b00",
 textColor ="#ffffff",
 fillColor ="#ffffff",
 hoverTextColor ="#ff6b00",
 dotColor,
 ...props
}) => {
 const textRef = useRef(null);
 const [hovered, setHovered] = useState(false);
 const [isMobile, setIsMobile] = useState(false);
 const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
 const releaseTimeoutRef = useRef(null);

 useEffect(() => {
 const el = textRef.current;
 if (!el) return;

 const sourceText = btnText ||"";
 el.innerHTML ="";

 [...sourceText].forEach((char, index) => {
 const span = document.createElement("span");
 span.textContent = char;
 span.style.transitionDelay = prefersReducedMotion ? "0s" : `${index * staggerStep}s`;

 if (char ===" ") {
 span.style.whiteSpace ="pre";
 }

 el.appendChild(span);
 });
 }, [btnText, staggerStep, prefersReducedMotion]);

	useEffect(() => {
		const el = textRef.current;
		if (!el) return;

		const spans = Array.from(el.children || []);
		spans.forEach((span) => {
			span.style.display = "inline-block";
			span.style.position = "relative";
			span.style.textShadow = "0px 1.3em currentColor";
			span.style.transform = "translateY(0em) rotate(0.001deg)";
			span.style.transition = prefersReducedMotion
				? "none"
				: "transform 0.6s cubic-bezier(0.625, 0.05, 0, 1), color 0.6s cubic-bezier(0.625, 0.05, 0, 1)";
			span.style.willChange = "transform";
		});
	}, [btnText, staggerStep, prefersReducedMotion]);

	useEffect(() => {
		const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

		const syncReducedMotion = (event) => {
			const matches = "matches" in event ? event.matches : event.currentTarget.matches;
			setPrefersReducedMotion(matches);
		};

		if (mediaQuery) {
			syncReducedMotion(mediaQuery);
			mediaQuery.addEventListener("change", syncReducedMotion);
		}

		return () => mediaQuery?.removeEventListener("change", syncReducedMotion);
	}, []);

	useEffect(() => {
		const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

		const syncIsMobile = (event) => {
			const matches = "matches" in event ? event.matches : event.currentTarget.matches;
			setIsMobile(matches);
		};

		syncIsMobile(mediaQuery);
		mediaQuery.addEventListener("change", syncIsMobile);

		return () => mediaQuery.removeEventListener("change", syncIsMobile);
	}, []);

	useEffect(() => {
		return () => {
			if (releaseTimeoutRef.current) {
				window.clearTimeout(releaseTimeoutRef.current);
			}
		};
	}, []);

	const handleMouseEnter = () => {
		if (isMobile) return;
		const el = textRef.current;
		if (el) {
			Array.from(el.children).forEach((span) => {
				span.style.transform = "translateY(-1.3em) rotate(0.001deg)";
			});
		}
		setHovered(true);
	};

	const handleMouseLeave = () => {
		if (isMobile) return;
		const el = textRef.current;
		if (el) {
			Array.from(el.children).forEach((span) => {
				span.style.transform = "translateY(0em) rotate(0.001deg)";
			});
		}
		setHovered(false);
	};

	const handlePointerDown = (event) => {
		props.onPointerDown?.(event);

		if (!isMobile || event.pointerType === "mouse") {
			return;
		}

		if (releaseTimeoutRef.current) {
			window.clearTimeout(releaseTimeoutRef.current);
		}

		const el = textRef.current;
		if (el) {
			Array.from(el.children).forEach((span) => {
				span.style.transform = "translateY(-1.3em) rotate(0.001deg)";
			});
		}
		setHovered(true);

		releaseTimeoutRef.current = window.setTimeout(() => {
			const currentEl = textRef.current;
			if (currentEl) {
				Array.from(currentEl.children).forEach((span) => {
					span.style.transform = "translateY(0em) rotate(0.001deg)";
				});
			}
			setHovered(false);
			releaseTimeoutRef.current = null;
		}, MOBILE_HOLD_MS);
	};

	return (
		<a
			href={href}
			{...props}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onPointerDown={handlePointerDown}
			className={`group relative flex w-fit mx-auto items-center justify-center h-[4.2vw] pl-[3.1vw] pr-[2vw] rounded-full overflow-hidden whitespace-nowrap no-underline font-medium text-[1.5vw] transition-colors duration-500 motion-reduce:transition-none max-xl:h-[9vw] max-xl:pl-[7.6vw] max-xl:pr-[4vw] max-xl:text-[3vw] max-xl:font-normal max-xl:motion-reduce:transition-none max-md:h-[15vw] max-md:pl-[11.8vw] max-md:pr-[6vw] max-md:text-[4.2vw] max-md:motion-reduce:transition-none ${className}`}
			style={{
				background: bgColor,
				color: hovered ? hoverTextColor : textColor,
			}}
		>
			<span
				aria-hidden
				className={`absolute left-[1.7vw] top-[55%] max-xl:top-[57%] w-[0.5vw] h-[0.5vw] rounded-full z-10 transform -translate-y-1/2 transition-transform duration-500 motion-reduce:transition-none max-xl:left-[3.5vw] max-xl:w-[1.5vw] max-xl:h-[1.5vw] max-xl:motion-reduce:transition-none max-md:left-[6vw] max-md:w-[2.3vw] max-md:h-[2.3vw] max-md:motion-reduce:transition-none`}
				style={{
					background: dotColor || fillColor,
					transform:
						hovered
							? "translateY(-50%) scale(120)"
							: "translateY(-50%) scale(1)",
					transitionTimingFunction: "cubic-bezier(0.785, 0.135, 0.15, 0.86)",
				}}
			/>

			<span className="relative z-20 flex h-full items-center">
				<span
					ref={textRef}
					className={`relative flex items-center overflow-hidden leading-[1.2] ${textClassName}`}
					aria-hidden={false}
				>
					{btnText}
				</span>
			</span>
		</a>
	);
};

export default DotFillBtn;
