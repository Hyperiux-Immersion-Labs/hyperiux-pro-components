// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import ScrollScatterComp, {
  type ScrollScatterCard,
} from "./ScrollScatterComp";

const IMG_BASE =
  "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/scroll-scatter";

const IMG = {
  plane: `${IMG_BASE}/img01.png`,
  painting: `${IMG_BASE}/img02.png`,
  breaker: `${IMG_BASE}/img03.png`,
  dog: `${IMG_BASE}/img04.png`,
  footballer: `${IMG_BASE}/img05.png`,
  jacket: `${IMG_BASE}/img06.jpg`,
  meadow: `${IMG_BASE}/img07.jpg`,
  stripes: `${IMG_BASE}/img08.png`,
} as const;

// per-image rest scale, keyed by img index (1-8). default 1, drop below to shrink.
const SCALE: Partial<Record<number, number>> = {
  1: 0.9,
  2: 0.8,
  3: 0.9,
  4: 0.8,
  5: 0.8,
  6: 0.9,
  7: 0.9,
  8: 0.7,
};
const s = (i: number) => SCALE[i] ?? 1;

// array order = stack order, back (z 2) -> front (z 9)
const CARDS: ScrollScatterCard[] = [
  // top-left stripes (img08) — sm row 1 left
  {
    item: { src: IMG.stripes, alt: "Colour stripes" },
    stackOffset: { x: -8, y: -10 },
    stackRotate: -18,
    target: { x: -20, y: -34, rotate: 0, scale: s(8), w: 17, h: 22 },
    targetSm: { x: -22, y: -40 },
    z: 2,
  },
  // top-right meadow (img07) — sm row 1 right
  {
    item: { src: IMG.meadow, alt: "Wildflower meadow" },
    stackOffset: { x: 14, y: -10 },
    stackRotate: 20,
    target: { x: 32, y: -30, rotate: 0, scale: s(7), w: 18, h: 32 },
    targetSm: { x: 22, y: -40 },
    z: 3,
  },
  // mid-left jacket (img06) — sm row 2 left
  {
    item: { src: IMG.jacket, alt: "Figure in a leather jacket" },
    stackOffset: { x: -16, y: 0 },
    stackRotate: -4,
    target: { x: -36, y: -2, rotate: 0, scale: s(6), w: 15, h: 32 },
    targetSm: { x: -22, y: -19 },
    z: 4,
  },
  // top-centre footballer (img05) — sm row 2 right
  {
    item: { src: IMG.footballer, alt: "Footballer mid-kick" },
    stackOffset: { x: 1, y: -10 },
    stackRotate: -2,
    target: { x: 6, y: -32, rotate: 0, scale: s(5), w: 25, h: 30 },
    targetSm: { x: 22, y: -19 },
    z: 5,
  },
  // mid-right dog (img04) — sm row 3 left
  {
    item: { src: IMG.dog, alt: "Terrier in profile" },
    stackOffset: { x: 18, y: 1 },
    stackRotate: 6,
    target: { x: 37, y: 6, rotate: 0, scale: s(4), w: 18, h: 32 },
    targetSm: { x: -22, y: 20 },
    z: 6,
  },
  // bottom-left breaker (img03) — sm row 3 right
  {
    item: { src: IMG.breaker, alt: "Breakdancer holding a pose" },
    stackOffset: { x: -6, y: 10 },
    stackRotate: 6,
    target: { x: -24, y: 34, rotate: 0, scale: s(3), w: 22, h: 25 },
    targetSm: { x: 22, y: 20 },
    z: 7,
  },
  // bottom-centre painting (img02) — sm row 4 left
  {
    item: { src: IMG.painting, alt: "Renaissance fresco detail" },
    stackOffset: { x: 8, y: 7 },
    stackRotate: 3,
    target: { x: 2, y: 36, rotate: 0, scale: s(2), w: 20, h: 26 },
    targetSm: { x: -22, y: 40 },
    z: 8,
  },
  // bottom-right plane (img01) — sm row 4 right
  {
    item: { src: IMG.plane, alt: "Vintage fighter plane" },
    stackOffset: { x: 20, y: 12 },
    stackRotate: -7,
    target: { x: 30, y: 34, rotate: 0, scale: s(1), w: 16, h: 20 },
    targetSm: { x: 22, y: 40 },
    z: 9,
  },
];

export interface ScrollScatterProps {
  scrollLength?: number;
  bgColor?: string;
  /** fan the clustered stack (default) or start flat */
  clusterRotation?: boolean;
}

export default function ScrollScatter({
  scrollLength = 350,
  bgColor = "#ececeb",
  clusterRotation = true,
}: ScrollScatterProps) {
  return (
    <ScrollScatterComp
      cards={CARDS}
      scrollLength={scrollLength}
      bgColor={bgColor}
      clusterRotation={clusterRotation}
    />
  );
}
