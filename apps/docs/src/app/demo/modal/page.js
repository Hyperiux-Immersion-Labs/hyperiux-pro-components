import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import Modal from "@/components/modal";

export default function Page() {
  return (
    <>
      <LenisSmoothScroll />
      <DemoHeader />

      <section
        className="
          relative flex w-screen  bg-white py-[2%]
          max-md:py-[12%]
          max-sm:pt-[18%] h-screen overflow-hidden max-sm:pb-[16%]
        "
      >
        <div
          className="
            flex h-screen w-full flex-col items-center justify-center  gap-40
            max-md:gap-[6vw]
            max-sm:gap-[10vw]
          "
        >
          <div
            className="
              flex flex-col items-center gap-[2vw]
              max-md:gap-[2vw]
              max-sm:gap-[4vw]
            "
          >
            <h1
              className="
                text-center font-medium leading-none text-[#111111]
                text-[4.5vw]
                max-md:text-[7vw]
                max-sm:text-[11vw]
              "
            >
              Modal
            </h1>

            <p
              className="
                max-w-[34vw] text-center text-[#555555]
                text-[1.3vw] leading-[1.2]
                max-md:max-w-[70vw] max-md:text-[2.5vw]
                max-sm:max-w-[84vw] max-sm:text-[4vw]
              "
            >
              Click the button below to open the modal and view the content.
            </p>
          </div>

          <Modal />
        </div>
      </section>
    </>
  );
}
