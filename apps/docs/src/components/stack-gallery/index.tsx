// Built using Hyperiux Vault: https://vault.hyperiux.com
import StackGalleryComp, {
  type StackGalleryItem,
  type StackGalleryCompProps,
} from './StackGalleryComp';

export type { StackGalleryItem };

const defaultItems: StackGalleryItem[] = [
  { id: 0, image: 'https://picsum.photos/seed/stack-gallery-0/800/1000', alt: 'Trail shoe', caption: 'Trail shoe' },
  { id: 1, image: 'https://picsum.photos/seed/stack-gallery-1/800/1000', alt: 'Field eyewear', caption: 'Field eyewear' },
  { id: 2, image: 'https://picsum.photos/seed/stack-gallery-2/800/1000', alt: 'Turf boot', caption: 'Turf boot' },
  { id: 3, image: 'https://picsum.photos/seed/stack-gallery-3/800/1000', alt: 'Court ball', caption: 'Court ball' },
  { id: 4, image: 'https://picsum.photos/seed/stack-gallery-4/800/1000', alt: 'Alpine boot', caption: 'Alpine boot' },
  { id: 5, image: 'https://picsum.photos/seed/stack-gallery-5/800/1000', alt: 'Court racket', caption: 'Court racket' },
];

const StackGallery = ({
  items = defaultItems,
  title = 'Field Kit',
  meta = 'VANTA / Product photography / 2026',
  description = 'Six frames from one afternoon in the studio. Every piece shot on the same light, so the range reads as one family.',
  backgroundColor = '#e9e9e7',
  textColor = '#111111',
  mutedColor = '#8a8a86',
  rounded = 20,
  thumbWidth = 108,
  thumbHeight = 120,
  thumbGap = 12,
  heroWidth = 530,
  heroHeight = 670,
  duration = 0.85,
  ease = 'power3.inOut',
  stackOffsetX = 3,
  stackOffsetY = 9,
  stackRotation = 0,
  showCounter = true,
  onClose,
  className = '',
}: StackGalleryCompProps) => {
  return (
    <StackGalleryComp
      items={items}
      title={title}
      meta={meta}
      description={description}
      backgroundColor={backgroundColor}
      textColor={textColor}
      mutedColor={mutedColor}
      rounded={rounded}
      thumbWidth={thumbWidth}
      thumbHeight={thumbHeight}
      thumbGap={thumbGap}
      heroWidth={heroWidth}
      heroHeight={heroHeight}
      duration={duration}
      ease={ease}
      stackOffsetX={stackOffsetX}
      stackOffsetY={stackOffsetY}
      stackRotation={stackRotation}
      showCounter={showCounter}
      onClose={onClose}
      className={className}
    />
  );
};

export default StackGallery;
