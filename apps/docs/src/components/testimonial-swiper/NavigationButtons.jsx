import { ArrowLeft, ArrowRight } from "lucide-react";

export default function NavigationButtons({ onPrev, onNext, isAnimating }) {
    return (
        <nav className="flex gap-1.5">
            {/* PREV */}
            <button
                aria-label="Previous testimonial"
                onClick={onPrev}
                disabled={isAnimating}
                className="w-11 h-11 relative flex items-center group justify-center border border-black/18 bg-transparent text-base cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
            >
                
                <ArrowLeft
                    size={16}
                    className="text-black transition-all duration-300 group-hover:scale-[0.9]"
                />
            </button>

            {/* NEXT */}
            <button
                aria-label="Next testimonial"
                onClick={onNext}
                disabled={isAnimating}
                className="w-11 h-11 flex overflow-hidden relative group items-center justify-center border border-black/18 bg-transparent text-base cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
               
                <ArrowRight
                    size={16}
                    className="text-black transition-all duration-300 group-hover:scale-[0.9]"
                />
            </button>
        </nav>
    );
}