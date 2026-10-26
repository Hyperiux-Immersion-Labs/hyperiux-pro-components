// Built using Hyperiux Vault: https://vault.hyperiux.com

import Image, { type StaticImageData } from "next/image";
import { FadeUp } from "../Animations/gsapAnim";

type QuoteBlockProps = {
  quote: string;
  name: string;
  role: string;
  image: StaticImageData;
};

const QuoteBlock = ({ quote, name, role, image }: QuoteBlockProps) => (
  <FadeUp
    as="figure"
    className="flex w-[75%] flex-col gap-8 max-lg:w-full max-md:gap-6"
  >
    <blockquote
      data-cursor-fill
      className="font-mpx-head text-64 font-normal leading-[1.2] text-balance"
    >
      <p>{quote}</p>
    </blockquote>
    <figcaption className="flex items-center gap-4">
      <div className="aspect-square h-[7vh] shrink-0 overflow-hidden rounded-full max-lg:h-[5vh] max-md:h-[8vh]">
        <Image
          quality={95}
          src={image}
          alt=""
          sizes="6vw"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <cite className="text-22 font-medium not-italic">{name}</cite>
        <span className="text-14 text-mpx-muted">{role}</span>
      </div>
    </figcaption>
  </FadeUp>
);

export default QuoteBlock;
