import TestimonialComp from "./TestimonialComp";

const data = [
  {
    quote:
      "Design that feels completely effortless, yet performs like it's been engineered with precision. Every interaction flows naturally, every detail feels intentional, and the entire experience just makes sense without the user ever needing to think about it.",
    name: "Aarav Mehta",
    title: "Product Lead, InnovateX",
    image:
      "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg",
  },
  {
    quote:
      "Hyperiux didn't just improve our UI , it transformed the way users interact with our product. It pushed us to rethink our entire approach to design, making every screen more intuitive, more fluid, and far more engaging than we thought possible.",
    name: "Sofia Patel",
    title: "Frontend Developer",
    image:
      "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg",
  },
  {
    quote:
      "Everything feels intentional. Every hover, every transition, every detail , it's crafted, not just built.",
    name: "Rohan Kapoor",
    title: "UX Designer, PixelCraft",
    image:
      "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg",
  },
  {
    quote:
      "We didn't just ship faster , we shipped something we're genuinely proud of. The design quality improved, the development flow became smoother, and for the first time, everything felt aligned between vision and execution.",
    name: "Ananya Sharma",
    title: "Founder, Buildspace Studio",
    image:
      "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-09.jpg",
  },
  {
    quote:
      "It's rare to find a UI system that's both aesthetic and brutally practical. This one just gets it.",
    name: "Dev Malhotra",
    title: "Full Stack Engineer",
    image:
      "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-11.jpg",
  },
];

const TestimonialSwiper = () => {
  return (
    <div className="h-screen bg-white max-sm:h-fit">
      <TestimonialComp testimonials={data} bgColor="#edeae2" />
    </div>
  );
};

export default TestimonialSwiper;
