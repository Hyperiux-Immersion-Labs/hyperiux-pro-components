// Built using Hyperiux Vault: https://vault.hyperiux.com

import Image from "next/image";
import { FadeUp, RuleDraw } from "../Animations/gsapAnim";
import PixelReveal from "../effects/pixel-reveal";
import UnderlineLink from "../Buttons/UnderlineLink";
import { servicePath } from "../../routes";
import { SERVICES } from "./services";

const ServiceList = () => (
  <ul className="flex flex-col">
    {SERVICES.map((service, index) => (
      <li key={service.title} className="relative">
        <RuleDraw syncWithFade className="absolute inset-x-0 top-0 h-px bg-(--mpx-ink)/10" />
        {index === SERVICES.length - 1 && (
          <RuleDraw syncWithFade className="absolute inset-x-0 bottom-0 h-px bg-(--mpx-ink)/10" />
        )}
        <FadeUp>
        <div
          data-cursor="Explore"
          className="group grid grid-cols-12 gap-x-9 gap-y-5 max-lg:gap-x-0 py-[3vw] max-lg:py-[5vw] max-md:py-[8vw]"
        >
          <h3 className="col-span-4 text-40 text-(color:--mpx-ink) transition-colors duration-300 group-hover:text-(color:--mpx-accent) max-lg:col-span-12">
            {service.title}
          </h3>
          <div className="col-span-5 flex flex-col items-start gap-5 max-lg:col-span-12">
            <p className="text-24 leading-[1.3] text-mpx-muted">
              {service.text}
            </p>
            <ul className="flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex h-[3.2vh] items-center rounded-full bg-mpx-surface px-[0.9vw] text-14 max-lg:h-[2.8vh] max-lg:px-[1.8vw] max-md:h-[4.1vh] max-md:px-[3.5vw]"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <UnderlineLink
              href={servicePath(service.slug)}
              className="font-mpx-head text-22 font-medium text-(color:--mpx-ink)"
            >
              Explore {service.title}
            </UnderlineLink>
          </div>
          <div className="col-span-3 aspect-[4/3] overflow-hidden rounded-lg max-lg:col-span-12 max-lg:w-[60%] max-md:w-full">
            <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.06]">
              <PixelReveal
                gridSize={26}
                edgeHeight={0.4}
                direction="down"
                start="top 85%"
                className="h-full w-full"
              >
                <Image
                  quality={95}
                  src={service.image}
                  alt=""
                  sizes="(max-width: 768px) 90vw, 26vw"
                  className="h-full w-full object-cover"
                />
              </PixelReveal>
            </div>
          </div>
        </div>
        </FadeUp>
      </li>
    ))}
  </ul>
);

export default ServiceList;
