import React from'react'
import { ClippathSlider } from'@/components/Slider/ClippathSlider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'

const page = () => {
 return (
 <>
 {/* <DemoHeader logoColor='#ffffff'/> */}
 <ClippathSlider
 slides={slides}
 clueText="Click either side and watch the next scene cut through."
 />
 </>
 )
}

export default page

const slides = [
  {
    name: "Motion Systems",
    description:
      "Crafting immersive motion-driven interfaces with smooth transitions, interactive timelines, and modern animation systems.",
    image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg",
  },
  {
    name: "Creative Components",
    description:
      "A curated collection of expressive UI components designed for futuristic web experiences and rapid development.",
    image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg",
  },
  {
    name: "Visual Interactions",
    description:
      "Building visually rich interactions with hover effects, layered depth, dynamic layouts, and fluid user feedback.",
    image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg",
  },
  {
    name: "Future Interfaces",
    description:
      "Exploring next-generation interface patterns that blend cinematic motion with minimal and functional design.",
    image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-08.jpg",
  },
  {
    name: "Design Engine",
    description:
      "Creating scalable design systems and reusable interface architectures optimized for modern frontend workflows.",
    image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-09.jpg",
  },
  {
    name: "Scroll Experiences",
    description:
      "Designing immersive scroll-based storytelling experiences powered by fluid motion and seamless transitions.",
    image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg",
  },
  {
    name: "Interactive Layers",
    description:
      "Combining lighting, gradients, and layered compositions to create premium interactive web experiences.",
    image: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-06.jpg",
  },
];
