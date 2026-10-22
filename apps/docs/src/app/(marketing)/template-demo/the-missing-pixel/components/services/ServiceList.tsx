// Built using Hyperiux Vault: https://vault.hyperiux.com

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { FadeUp } from "../Animations/gsapAnim";
import { ArrowUpRight } from "../Buttons/icons";
import cloudline from "../../assets/w-cloudline.webp";
import kickflip from "../../assets/w-kickflip.webp";
import northway from "../../assets/w-northway.webp";
import drift from "../../assets/w-drift.webp";
import { ROUTES } from "../../routes";

type Service = {
  title: string;
  text: string;
  tags: string[];
  image: StaticImageData;
};

const ServiceList = () => (
  <ul className="flex flex-col border-b border-black/10">
    {SERVICES.map((service) => (
      <FadeUp as="li" key={service.title}>
        <Link
          href={ROUTES.service}
          data-cursor="Explore"
          className="group flex items-center justify-between gap-9 border-t border-black/10 py-[2.4vw] max-lg:flex-col max-lg:items-start max-lg:gap-6 max-lg:py-[5vw] max-md:py-[8vw]"
        >
          <h2 className="w-[30%] text-[#0a0a0a] transition-colors duration-300 group-hover:text-[#ff5f00] max-lg:w-full">{service.title}</h2>
          <div className="flex w-[34%] flex-col items-start gap-5 max-lg:w-full">
            <p className="text-28 text-mpx-muted">{service.text}</p>
            <ul className="flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex h-[3.2vh] items-center rounded-full border border-black/20 px-[0.9vw] text-14 max-lg:h-[2.8vh] max-lg:px-[1.8vw] max-md:h-[4.1vh] max-md:px-[3.5vw]"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <span className="font-mpx-head inline-flex items-center gap-2 text-22 font-medium text-[#0a0a0a] transition-colors duration-300 group-hover:text-[#ff5f00]">
              Explore {service.title}
              <ArrowUpRight className="size-[1.2vw] transition-transform duration-500 group-hover:rotate-45 max-lg:size-[2.2vw] max-md:size-[4.6vw]" />
            </span>
          </div>
          <div className="aspect-[4/3] w-[26%] overflow-hidden rounded-2xl bg-mpx-surface max-lg:w-[60%] max-md:w-full">
            <Image
              src={service.image}
              alt=""
              sizes="(max-width: 768px) 90vw, 26vw"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </Link>
      </FadeUp>
    ))}
  </ul>
);

export default ServiceList;

const SERVICES: Service[] = [
  {
    title: "Brand strategy",
    text: "Positioning, naming and messaging that make your whole company sound like one person.",
    tags: ["Research", "Positioning", "Naming", "Messaging", "Tone of voice"],
    image: cloudline,
  },
  {
    title: "Brand identity",
    text: "Logos, type and systems that look just as sharp on a billboard as on a favicon.",
    tags: ["Logo systems", "Visual language", "Guidelines", "Toolkits"],
    image: kickflip,
  },
  {
    title: "Websites and products",
    text: "Fast, accessible sites and products, designed and engineered under one roof.",
    tags: ["UX and UI", "Webflow and custom", "Design systems", "Accessibility"],
    image: northway,
  },
  {
    title: "Motion and 3D",
    text: "Identities that move, launch films and product visuals people actually replay.",
    tags: ["Motion identity", "Launch films", "3D product", "UI motion"],
    image: drift,
  },
  {
    title: "Packaging",
    text: "Packs that win the shelf, then earn a second life on someone’s bookcase.",
    tags: ["Structure", "Range architecture", "Production", "Sustainability"],
    image: cloudline,
  },
  {
    title: "Content and campaigns",
    text: "Launches and social systems with something to say, and the nerve to say it.",
    tags: ["Campaign ideas", "Social systems", "Art direction", "Copywriting"],
    image: kickflip,
  },
];
