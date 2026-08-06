import ShearWipeComp from './ShearWipeComp';

const componentHighlights = [
  { label: '01', title: 'Motion-first components', desc: 'Every element reacts, transitions, and guides attention with intent.' },
  { label: '02', title: 'Built with GSAP', desc: 'Battle-tested easing and timelines power every interaction.' },
  { label: '03', title: 'Copy-paste ready', desc: 'Drop straight into any React project, no rebuilding required.' },
  { label: '04', title: 'Production-tested', desc: 'Patterns refined across real client launches, not just demos.' },
];

const showcaseStats = [
  { value: '150+', label: 'Animated components' },
  { value: '500+', label: 'Developers shipping with Vault' },
  { value: '50k+', label: 'Downloads across the registry' },
  { value: '4.9/5', label: 'Average developer rating' },
];

const ShearWipe = () => {
  return (
    <ShearWipeComp
      componentHighlights={componentHighlights}
      showcaseStats={showcaseStats}
      componentsBg="bg-[#C7D3C0]"
      componentsTextColor="text-black"
      showcaseBg="bg-[#8FA28A]"
      showcaseTextColor="text-white"
    />
  );
};

export default ShearWipe;
