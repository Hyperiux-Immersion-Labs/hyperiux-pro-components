
import InertiaImageComp from './InertiaImgComp';

const images = [
   "https://picsum.photos/seed/1/800/600",
    "https://picsum.photos/seed/2/800/600",
    "https://picsum.photos/seed/3/800/600",
    "https://picsum.photos/seed/4/800/600",
    "https://picsum.photos/seed/5/800/600",
    "https://picsum.photos/seed/6/800/600",
    "https://picsum.photos/seed/7/800/600",
    "https://picsum.photos/seed/8/800/600",
    "https://picsum.photos/seed/9/800/600",
    "https://picsum.photos/seed/10/800/600",
    "https://picsum.photos/seed/11/800/600",
    "https://picsum.photos/seed/12/800/600",
];

const InertiaImage = () => {
  return (
    <>
      <InertiaImageComp images={images}/>
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center  backdrop-blur-sm max-xl:hidden"
      >
        <h2 className="text-sm leading-none text-white">
          The image keeps drifting.
        </h2>
        <p className="mt-2 text-xs leading-5 text-white/65">
          Inertia Image moves with simulated momentum from your cursor or touch.
          Because the physics is the effect, reduced motion can&apos;t be
          honored here.
        </p>
      </div>
    </>
  )
}

export default InertiaImage
