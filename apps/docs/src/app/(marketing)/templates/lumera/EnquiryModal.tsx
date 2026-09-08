// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";
import AnimatedForm from "./effects/animated-form";

// The enquiry modal is opened from several places that aren't in the same
// subtree (Header's "Enquire Now", Hero's "Speak With an Advisor" and
// "Explore Our Collection"), so the open/close state lives in a provider
// wrapped around the page instead of inside any one section.
type EnquiryContextValue = {
  openEnquiryModal: () => void;
  closeEnquiryModal: () => void;
};

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

export function useEnquiryModal(): EnquiryContextValue {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error("useEnquiryModal must be used within <EnquiryModalProvider>");
  }
  return context;
}

export const EnquiryModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenis = useLenis();
  // `mounted` keeps the dialog in the DOM through its 300ms close transition;
  // `open` drives the opacity/scale classes.
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryMounted, setEnquiryMounted] = useState(false);

  const openEnquiryModal = useCallback(() => {
    setEnquiryMounted(true);
    window.requestAnimationFrame(() => setEnquiryOpen(true));
  }, []);

  const closeEnquiryModal = useCallback(() => {
    setEnquiryOpen(false);
    window.setTimeout(() => setEnquiryMounted(false), 300);
  }, []);

  useEffect(() => {
    if (!enquiryMounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEnquiryModal();
      }
    };

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    lenis?.stop?.();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      lenis?.start?.();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enquiryMounted, lenis, closeEnquiryModal]);

  const value = useMemo(
    () => ({ openEnquiryModal, closeEnquiryModal }),
    [openEnquiryModal, closeEnquiryModal]
  );

  return (
    <EnquiryContext.Provider value={value}>
      {children}
      {enquiryMounted && (
        <div
          className={`fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-[5%] py-[5vw] backdrop-blur-sm transition-opacity duration-300 max-[1025px]:items-start max-[1025px]:overflow-y-auto max-[1025px]:py-[10vw] ${
            enquiryOpen ? "opacity-100" : "opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Lumera enquiry form"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEnquiryModal();
            }
          }}
        >
          <div
            className={`relative h-[85vh] max-md:h-[80vh] w-full max-w-[42vw] overflow-y-auto rounded-[1.4vw] bg-[white] p-[2vw] shadow-2xl transition-all duration-300 max-[1025px]:max-w-[86vw] max-[1025px]:rounded-[4vw] max-[1025px]:p-[5vw] max-md:max-w-[92vw] max-md:p-[6vw] ${
              enquiryOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-[2vw] scale-[0.98] opacity-0"
            }`}
          >
            <button
              type="button"
              aria-label="Close enquiry form"
              onClick={closeEnquiryModal}
              className="sticky left-full top-0 z-10 flex h-[2.8vw] w-[2.8vw] items-center justify-center rounded-full bg-[#1c1b1a] text-white transition-transform duration-300 hover:rotate-180 max-[1025px]:h-[9vw] max-[1025px]:w-[9vw]"
            >
              <X className="h-[1.2vw] w-[1.2vw] max-[1025px]:h-[4vw] max-[1025px]:w-[4vw]" strokeWidth={1.8} />
            </button>
            <AnimatedForm />
          </div>
        </div>
      )}
    </EnquiryContext.Provider>
  );
};

export default EnquiryModalProvider;
