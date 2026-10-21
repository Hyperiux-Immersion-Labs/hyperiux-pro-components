// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { StaticImageData } from "next/image";
import AutoVideo from "../shared/AutoVideo";
import { MediaReveal } from "../Animations/gsapAnim";
import ParallaxImage from "../effects/parallax-image";

type GalleryProps = {
  items: { image: StaticImageData; alt: string; full?: boolean }[];
  video: { src: string; poster: string; label: string };
};

const Gallery = ({ items, video }: GalleryProps) => (
  <div className="grid grid-cols-2 gap-9 max-lg:gap-6 max-md:grid-cols-1">
    {items.map((item) => (
      <ParallaxImage
        key={item.alt}
        image={item.image}
        alt={item.alt}
        className={`rounded-3xl ${item.full ? "col-span-2 aspect-video max-md:col-span-1" : "aspect-[4/5] max-md:aspect-[4/3]"}`}
        sizes={item.full ? "90vw" : "45vw"}
      />
    ))}
    <MediaReveal className="col-span-2 aspect-video rounded-3xl bg-[#0a0a0a] max-md:col-span-1">
      <AutoVideo src={video.src} poster={video.poster} label={video.label} />
    </MediaReveal>
  </div>
);

export default Gallery;
