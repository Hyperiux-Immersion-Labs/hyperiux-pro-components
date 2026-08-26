// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import Link from "next/link";
import DraggableMarqueeComp from "./DraggableMarqueeComp";

const serviceButtons = [
  { id: "brochure", text: "Download Brochure", link: "#" },
  { id: "floor-plan", text: "Download Floor Plan", link: "#" },
  { id: "payment-plan", text: "Download Payment Plan", link: "#" },
  { id: "drawings", text: "Download Architectural Drawings", link: "#" },
  { id: "amenities", text: "View Amenities", link: "#" },
  { id: "visit", text: "Schedule a Visit", link: "#" },
  { id: "sales", text: "Contact Sales Team", link: "#" },
];

interface ServiceButtonProps {
  link: string;
  btnText: string;
  className?: string;
}

const ServiceButton = ({ link, btnText, className }: ServiceButtonProps) => {
  return (
    <Link
      href={link}
      className={`fadeUp inline-flex h-[7.2vw] min-w-[30vw] items-center justify-center rounded-full border border-[#ca8216] bg-white px-[2.5vw] text-center text-[1.6vw] text-[#111111] [text-rendering:geometricPrecision] transition-all duration-300 hover:bg-white hover:text-[#1c1b1a] max-[1025px]:h-[7vw] max-[1025px]:min-w-[33.5vw] max-[1025px]:px-[2.5vw] max-[1025px]:text-[2.2vw] max-[1025px]:font-normal max-md:h-[15vw] max-md:min-w-[65vw] max-md:px-[4.5vw] max-md:text-[4.2vw] max-md:font-normal ${className ?? ""}`}
    >
      <span>{btnText}</span>
    </Link>
  );
};

interface DraggableMarqueeProps {
  speed?: number;
  pauseOnHover?: boolean;
  throwMultiplier?: number;
  throwFriction?: number;
}

const DraggableMarquee = ({
  speed = 1.2,
  pauseOnHover = false,
  throwMultiplier = 2.8,
  throwFriction = 0.975,
}: DraggableMarqueeProps) => {
  return (
    <DraggableMarqueeComp
      items={serviceButtons}
      speed={speed}
      pauseOnHover={pauseOnHover}
      throwMultiplier={throwMultiplier}
      throwFriction={throwFriction}
      repeatCount={4}
      gapClassName="gap-[2vw] max-[1025px]:gap-[4vw]"
      className="fadeup w-full py-[0.4vw]"
      itemClassName="select-none"
      renderItem={(item) => (
        <ServiceButton
          link={item.link ?? "#"}
          btnText={item.text ?? ""}
          className="shrink-0"
        />
      )}
    />
  );
};

export default DraggableMarquee;
