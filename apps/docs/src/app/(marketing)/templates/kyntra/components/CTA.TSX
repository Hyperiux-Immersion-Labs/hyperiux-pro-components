// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useState } from "react";
import Link from "next/link";
import CharStaggerPrimaryButton from "./effects/char-stagger-primary-button";
import { FadeUp } from "./Animations/gsapAnim";
import DownloadAppModal from "./DownloadAppModal";

const CTA = () => {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // The button is an anchor to "#", so the default jump has to be suppressed
  // before the modal takes over.
  const openModal = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setModalOpen(true);
  };

  // Opening the modal pulls the pointer off the button, which would otherwise
  // fire onPointerLeave and drop the blue back to grey. Keeping the panel
  // latched while the modal is open holds the colour through the interaction.
  const panelActive = hovered || modalOpen;

  return (
    <section
      id="cta"
      className={`relative flex h-screen max-[1025px]:h-[70vh] w-full flex-col items-center justify-center px-[5%] text-black transition-colors duration-300 ease-in-out ${
        panelActive ? "bg-kyntra-primary" : "bg-[#f5f5f5]"
      }`}
    >
      <div
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHovered(false);
        }}
        // Touch gets no hover model: tapping toggles the panel instead of
        // latching it on, since the link itself does not navigate.
        onClick={(e) => {
          const { pointerType } = e.nativeEvent as PointerEvent;
          if (pointerType === "touch" || pointerType === "pen") {
            setHovered((prev) => !prev);
          }
        }}
      >
        <FadeUp>
         
          {/* The char-stagger renders every character as its own inline-block,
              which fights a two-line wrap - so it stays desktop-only and mobile
              gets a plain button with ordinary text flow. */}
          <CharStaggerPrimaryButton
            text="Download Kyntra App"
            href="#"
            hoverColor="#ffffff"
            staggerStep={0.006}
            onClick={openModal}
            className="w-[45vw] justify-center rounded-full bg-black py-[2.5vw] text-center max-[1025px]:hidden"
            textClassName=" text-44 leading-[1.1] font-normal tracking-[-0.02em] text-white"
          />

          <Link
            href="#"
            onClick={openModal}
            className="hidden w-[80vw] rounded-full bg-black px-[6vw] py-[7vw] text-center text-[5vw] leading-tight font-normal tracking-[-0.02em] text-white max-[1025px]:block max-md:w-[85vw] max-md:py-[4vw] max-md:text-[7vw]"
          >
            Download Kyntra App
          </Link>
        </FadeUp>
      </div>

      <FadeUp
        as="p"
        delay={0.15}
        // Colour is driven by the same `panelActive` state as the section
        // background, so the copy flips to white as the panel turns blue.
        className={`text-24 mt-[2vw] transition-colors duration-300 ease-in-out max-[1025px]:mt-[5vw] max-[1025px]:max-w-[62%] max-[1025px]:text-center max-[1025px]:text-[2.9vw] max-md:mt-[6vw] max-md:max-w-[72%] max-md:text-[4.2vw] ${
          panelActive ? "text-white" : "text-black"
        }`}
      >
        Download Kyntra and create your first home profile.
      </FadeUp>

      <DownloadAppModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          // Touch latches the blue panel on tap, and the pointer is no longer
          // over the button on desktop, so the colour is released here.
          setHovered(false);
        }}
      />
    </section>
  );
};

export default CTA;
