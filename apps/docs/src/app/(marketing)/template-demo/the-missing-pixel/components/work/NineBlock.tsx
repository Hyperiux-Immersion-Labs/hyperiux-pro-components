// Built using Hyperiux Vault: https://vault.hyperiux.com

import Image from "next/image";
import Link from "next/link";
import { FadeUp } from "../Animations/gsapAnim";
import PixelButton from "../Buttons/PixelButton";
import UnderlineLink from "../Buttons/UnderlineLink";
import { ROUTES, workPath } from "../../routes";
import { PROJECTS } from "./projects";

const NineBlock = () => (
  <FadeUp className="grid grid-cols-12 items-center gap-x-9 gap-y-10 rounded-lg border border-(--mpx-ink)/10 bg-(--mpx-white) p-[3.5vw] max-lg:gap-x-6 max-lg:p-[5vw] max-md:p-[6vw]">
    <div className="col-span-6 flex flex-col items-start gap-8 max-lg:col-span-12">
      <h2 className="w-[70%] text-balance max-lg:w-full">Your project could be number nine.</h2>
      <p className="w-[80%] text-28 leading-[1.3] text-mpx-muted max-lg:w-full">
        Tell us what you’re making. A partner replies within two working days.
      </p>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-4 py-3">
        <PixelButton label="Start A Project" href={ROUTES.contact} icon />
        <UnderlineLink href="mailto:hello@themissingpixel.studio" className="text-22">
          hello@themissingpixel.studio
        </UnderlineLink>
      </div>
    </div>
    <ol className="col-span-5 col-start-8 grid grid-cols-3 gap-[0.7vw] max-lg:col-span-12 max-lg:col-start-1  max-lg:gap-2 max-lg:w-full">
      {PROJECTS.map((project) => (
        <li key={project.title}>
          <Link
            href={workPath(project.title)}
            aria-label={project.title}
            className="block aspect-square w-full overflow-hidden rounded-lg"
          >
            <Image
              quality={95}
              src={project.image}
              alt=""
              sizes="12vw"
              className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={ROUTES.contact}
          aria-label="Start a project"
          className="group flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-(--mpx-ink)/30 transition-colors duration-500 hover:border-(--mpx-ink)"
        >
          <span className="font-mpx-head text-40 text-mpx-muted transition-colors duration-500 group-hover:text-(color:--mpx-ink)">
            09
          </span>
        </Link>
      </li>
    </ol>
  </FadeUp>
);

export default NineBlock;
