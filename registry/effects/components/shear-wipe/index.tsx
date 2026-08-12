// Built using Hyperiux Vault: https://vault.hyperiux.com

import ShearWipeComp, { ShearWipeStat } from './ShearWipeComp';

const componentHighlights: ShearWipeStat[] = [
  { label: '01', title: 'Motion-first components', desc: 'Reacts with intent.' },
  { label: '02', title: 'Built with GSAP', desc: 'Battle-tested easing.' },
];

const showcaseStats: ShearWipeStat[] = [
  { label: '01', title: 'Cinematic reveals', desc: 'Scroll-driven scenes that unfold with intent.' },
  { label: '02', title: 'Built for impact', desc: 'Motion that turns browsing into an experience.' },
];

interface ShearWipeProps {
  clipPathDuration?: number;
  componentsBgImage?: string;
  componentsTextColor?: string;
  showcaseBgImage?: string;
  showcaseTextColor?: string;
}

const ShearWipe = ({
  clipPathDuration,
  componentsBgImage = 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-21.jpg',
  componentsTextColor = 'text-white',
  showcaseBgImage = 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-23.jpg',
  showcaseTextColor = 'text-white',
}: ShearWipeProps) => {
  return (
    <ShearWipeComp
      componentHighlights={componentHighlights}
      showcaseStats={showcaseStats}
      clipPathDuration={clipPathDuration}
      componentsBgImage={componentsBgImage}
      componentsTextColor={componentsTextColor}
      showcaseBgImage={showcaseBgImage}
      showcaseTextColor={showcaseTextColor}
    />
  );
};

export default ShearWipe;
