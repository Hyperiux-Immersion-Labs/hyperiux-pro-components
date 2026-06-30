
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

const ModalContent = ({
  isOpen = false,
  onClose,
  children,
  className = "",
  contentClassName = "",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  closeButtonClassName = "",
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (closeOnEsc && e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, closeOnEsc]);

  return (
    <div
      data-lenis-prevent
      className={`
        fixed inset-0 z-9999
        duration-500
        ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }
        ${className}
      `}
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={closeOnBackdrop ? onClose : undefined}
        className="
          absolute inset-0
          cursor-pointer border-0
          bg-black/82
          backdrop-blur-md
        "
      />

      {showCloseButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          aria-label="Close modal"
          className={`
            absolute z-99999
            flex items-center justify-center
            rounded-full border-0
            bg-black/80 text-white
            cursor-pointer
            backdrop-blur-md
            transition-all duration-300
            hover:scale-[1.04]
            hover:bg-white/20
            pointer-events-auto
            touch-manipulation
            min-w-10 min-h-10

            top-[1.5vw] right-[1.5vw] w-[3vw] h-[3vw]
            max-md:top-8 max-md:right-8 max-md:w-14 max-md:h-14
            max-sm:top-4 max-sm:right-4 max-sm:w-10 max-sm:h-10

            ${closeButtonClassName}
          `}
        >
          <X size={24} className="pointer-events-none" />
        </button>
      )}

      <div
        className={`
          relative z-1
          flex h-screen w-screen items-center
          px-0

          max-md:px-0
          max-sm:justify-center max-sm:px-0

          ${contentClassName}
        `}
      >
        {children}
      </div>
    </div>
  );
};

export { ModalContent };
