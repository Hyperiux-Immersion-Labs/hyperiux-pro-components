import { BookFlipp } from "./BookFlip";



export default function BookFlip() {
  return (
    <>
    <BookFlipp
      images={BOOK_IMAGES}
      pathPattern=""
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
    <div className="w-fit absolute text-white bottom-8 left-1/2 -translate-x-1/2 text-center">
    Click on the navigation buttons or the pages itself to flip pages of the book

    </div>
    </>
  );
}

const BOOK_IMAGES = [
  "https://picsum.photos/seed/book1/800/600",
  "https://picsum.photos/seed/book2/800/600",
  "https://picsum.photos/seed/book3/800/600",
  "https://picsum.photos/seed/book4/800/600",
  "https://picsum.photos/seed/book5/800/600",
  "https://picsum.photos/seed/book6/800/600",
  "https://picsum.photos/seed/book7/800/600",
  "https://picsum.photos/seed/book8/800/600",
  "https://picsum.photos/seed/book9/800/600",
  "https://picsum.photos/seed/book10/800/600",
  "https://picsum.photos/seed/book11/800/600",
  "https://picsum.photos/seed/book12/800/600",
  "https://picsum.photos/seed/book13/800/600",
  "https://picsum.photos/seed/book14/800/600",
];
