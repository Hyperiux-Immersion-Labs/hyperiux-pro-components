"use client";

import { useState } from "react";
import ScrollablePopupContent from "@/components/modal/ScrollablePopupContent";
import { ModalContent } from "./Modal";

const popupSections = [
  {
    heading: "Project Overview",
    paragraph:
      "This development is envisioned as a premium mixed-use destination, combining residential comfort, retail convenience, and elevated lifestyle experiences in one cohesive ecosystem.",
    list: [
      "Prime urban location with excellent access",
      "Integrated amenities for work, wellness, and leisure",
      "Architecture focused on long-term livability",
    ],
  },
  {
    heading: "Design Philosophy",
    paragraph:
      "Every detail has been planned to create an experience that feels contemporary, intuitive, and timeless. The emphasis is on spatial openness, natural light, and refined materials.",
    list: [
      "Open-plan living concepts",
      "Daylight-first spatial planning",
      "Contemporary material palette",
    ],
  },
  {
    heading: "Investment Potential",
    paragraph:
      "With strong connectivity, growing infrastructure, and a carefully positioned offering, the project is designed to appeal to both end-users and long-term investors seeking sustained value.",
    list: [
      "High-demand micro-market",
      "Future-forward development strategy",
      "Strong long-term appreciation potential",
    ],
  },
  {
    heading: "Lifestyle Experience",
    paragraph:
      "The experience extends beyond residences, offering amenities and shared spaces that promote wellness, community, and a more balanced urban lifestyle.",
    list: [
      "Curated leisure and wellness zones",
      "Community-first shared spaces",
      "Elevated everyday convenience",
    ],
  },
];

export default function Modal() {
  const [isContentOpen, setIsContentOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsContentOpen(true);
        }}
        className="
          cursor-pointer rounded-full border-0 bg-[#111111] px-[2vw] py-[1vw]
          text-white transition-all duration-300 hover:scale-[1.03]
          text-[1vw]
          max-md:px-[4vw] max-md:py-[2vw] max-md:text-[2.2vw]
          max-sm:px-[6vw] max-sm:py-[3.5vw] max-sm:text-[4vw]
        "
      >
        Open Modal
      </button>

      <ModalContent
        className="h-full backdrop-blur-none "
        isOpen={isContentOpen}
        onClose={() => setIsContentOpen(false)}
      >
        <ScrollablePopupContent
          title="A Deeper Look at the Project"
          subtitle="Explore the thinking, design strategy, and long-term value proposition behind the development."
          sections={popupSections}
        />
      </ModalContent>
    </>
  );
}
