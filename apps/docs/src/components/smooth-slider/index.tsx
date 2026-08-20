import SmoothSliderComp, {
  type SmoothSliderCompProps,
  type SmoothSliderItem,
} from "./SmoothSliderComp";

const defaultItems: SmoothSliderItem[] = [
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg",
    alt: "Editorial portrait",
  },
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-11.jpg",
    alt: "Studio still life",
  },
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-12.jpg",
    alt: "Type poster",
  },
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-13.jpg",
    alt: "Product campaign",
  },
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-14.jpg",
    alt: "Landscape study",
  },
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-15.jpg",
    alt: "Motion frame",
  },
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-22.jpg",
    alt: "Brand artwork",
  },
  {
    src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-23.jpg",
    alt: "Cover art",
  },
];

export type { SmoothSliderItem };

export default function SmoothSlider({ items = defaultItems, ...rest }: SmoothSliderCompProps) {
  return <SmoothSliderComp items={items} {...rest} />;
}
