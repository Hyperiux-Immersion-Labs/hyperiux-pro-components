// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { StaticImageData } from "next/image";
import ParallaxImage from "../effects/parallax-image";

type GalleryProps = {
  items: { image: StaticImageData; alt: string; full?: boolean }[];
};

const Gallery = ({ items }: GalleryProps) => (
  <div className="grid grid-cols-2 gap-9 max-lg:gap-6 max-md:grid-cols-1">
    {items.map((item) => (
      <ParallaxImage
        pixel
        hoverZoom
        key={item.alt}
        image={item.image}
        alt={item.alt}
        className={`rounded-lg ${item.full ? "col-span-2 aspect-video max-md:col-span-1" : "aspect-[4/5] max-md:aspect-[4/3]"}`}
        sizes={item.full ? "90vw" : "45vw"}
      />
    ))}
  </div>
);

export default Gallery;
