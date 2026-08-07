import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * @typedef {Object} NavigationButtonsProps
 * @property {() => void} [onPrev]
 * @property {() => void} [onNext]
 * @property {boolean} [isAnimating]
 * @property {string} [className]
 * @property {string} [accentColor]
 */

/** @param {NavigationButtonsProps} props */
export default function NavigationButtons({
    onPrev,
    onNext,
    isAnimating,
    className = "",
    accentColor = "#111111",
}: any) {
    return (
        <nav className={`flex gap-1.5 ${className}`}>
            {/* PREV */}
            <button
                aria-label="Previous testimonial"
                onClick={onPrev}
                disabled={isAnimating}
                className="w-11 h-11 relative flex items-center group justify-center border border-black/18 bg-transparent text-base cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
                style={{ borderColor: `${accentColor}66`, color: accentColor }}
            >
                <ArrowLeft
                    size={16}
                    className="absolute top-1/2  -translate-y-1/2  group-hover:scale-[0.9] group-hover:transition-all duration-500 group-hover:ease-out"
                />
            </button>

            {/* NEXT */}
            <button
                aria-label="Next testimonial"
                onClick={onNext}
                disabled={isAnimating}
                className="w-11 h-11 flex overflow-hidden relative group items-center justify-center border border-black/18 bg-transparent text-base cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: `${accentColor}66`, color: accentColor }}
            >
                <ArrowRight
                    size={16}
                    className="absolute top-1/2  -translate-y-1/2  group-hover:scale-[0.9]  group-hover:transition-all duration-500 group-hover:ease-out"
                />
            </button>
        </nav>
    );
}
