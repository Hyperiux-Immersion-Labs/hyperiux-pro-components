import { BookFlipp } from "./BookFlip";



export default function BookFlip() {
  return (
    <>
    <BookFlipp
      images={BOOK_IMAGES}
      pathPattern="/assets/nature"
      bgColor="#000000"
      cameraDistance={{
        mobile: 9,
        desktop: 4,
      }}
      floatConfig={{
        rotation_x: -Math.PI / 4,
        floatIntensity: 1,
        speed: 2,
        rotationIntensity: 2,
      }}
      showUI={true}
    />
    <div className="w-fit absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
    Click on the navigation buttons or the pages itself to flip pages of the book

    </div>
    </>
  );
}

const BOOK_IMAGES = [
  "nature01",
  "nature02",
  "nature03",
  "nature04",
  "nature05",
  "nature06",
  "nature07",
  "nature08",
  "nature09",
  "nature10",
  "nature11",
  "nature12",
  "nature13",
  "nature14",
];
