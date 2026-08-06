// Built using Hyperiux Vault: https://vault.hyperiux.com


import ScrollParallaxGallery from "./ParallaxGallery";

const ParallaxGallery = () => {
  return (
    <>
    <div className="min-h-screen">
      <ScrollParallaxGallery images={images} bgColor="#111111" />
    </div>
    </>
  );
};

export default ParallaxGallery;

const images = [
  "https://picsum.photos/seed/1/800/600",
  "https://picsum.photos/seed/2/800/600",
  "https://picsum.photos/seed/3/800/600",
  "https://picsum.photos/seed/4/800/600",
  "https://picsum.photos/seed/5/800/600",
  "https://picsum.photos/seed/6/800/600",
];
