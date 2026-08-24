import Image from "next/image";

const ProjectHover = () => {
  return (
    <>
      <section className="py-[10%] bg-[#161616] mobile:py-[20%] tablet:py-[10%]">
        <div className={`px-[5%] flex items-center justify-center`}>
          <div className="w-[90%] flex flex-col">
            {/* First Project */}
            <div className="text-center group" id="p1">
              <div className="flex w-fit mx-auto items-center justify-center mb-[2.8vw] relative gap-[1.5vw]">
                <p className={`uppercase font-heading text-white group-hover:translate-x-[-4.5vw] rtl:group-hover:translate-x-[4.5vw] duration-300 text-[4vw] leading-none font-medium ease-out tablet:text-[5vw] tablet:group-hover:translate-x-0 rtl:tablet:group-hover:translate-x-0`}>
                  <span className="tablet:text-[7vw]">25+</span>{" "}Years Of Experience
                </p>
                <div className="w-[6vw] absolute right-[-9%] h-[6vw] rtl:right-auto rtl:left-[-20%] top-[-25%] rounded-full overflow-hidden ml-[1.5vw] scale-0 duration-300 ease-out group-hover:scale-100 tablet:group-hover:scale-0">
                  <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=500&auto=format&fit=crop" alt="Images" width={200} height={200} className="object-cover h-full w-full" />
                </div>
              </div>
              <span className="w-full block h-[1px] bg-white mobile:my-[7vw] tablet:my-[4vw]"></span>
            </div>

            {/* Second Project */}
            <div className="text-center group" id="p2">
              <div className="flex items-center justify-center mt-[3.5vw] mb-[2.8vw] relative gap-[1.5vw]">
                <p className={`uppercase font-heading text-white group-hover:translate-x-[-4.5vw] rtl:group-hover:translate-x-[5.5vw] duration-300 text-[4vw] leading-none font-medium ease-out tablet:text-[5vw] tablet:group-hover:translate-x-0 rtl:tablet:group-hover:translate-x-0`}>
                  <span className="tablet:text-[7vw]">50K+</span>{" "}Home
                </p>{" "}
                <div className={`w-[6vw] absolute right-[47%] h-[6vw] top-[-10%] rtl:right-auto rtl:left-[35%] overflow-hidden ml-[1.5vw] scale-0 duration-300 ease-out group-hover:scale-100 [clip-path:circle(100%_at_0_100%)] tablet:hidden`}>
                  <Image src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=500&auto=format&fit=crop" alt="Images" width={250} height={250} className="object-cover h-full w-full" />
                </div>
                <p className={`uppercase font-heading text-white group-hover:translate-x-[4.5vw] rtl:group-hover:translate-x-[-4vw] duration-300 text-[4.5vw] leading-[1] ease-out tablet:text-[5vw] tablet:group-hover:translate-x-0 rtl:tablet:group-hover:translate-x-0 tablet:pt-[1vw]`}>
                  Delivered
                </p>
              </div>
              <span className="w-full block h-[1px]  bg-white mobile:my-[7vw] tablet:my-[4vw]"></span>
            </div>

            {/* Third Project */}
            <div className="text-center group" id="p3">
              <div className="flex items-center justify-center mt-[3.5vw] mb-[2.8vw] relative gap-[1.5vw]">
                <p className={`uppercase font-heading text-white group-hover:translate-x-[-5.5vw] rtl:group-hover:translate-x-[7.5vw] duration-300 text-[4vw] leading-none font-medium ease-out tablet:text-[7vw] tablet:group-hover:translate-x-0 rtl:tablet:group-hover:translate-x-0`}>
                  20+
                </p>{" "}
                <div className="w-[12vw] absolute right-[62%] h-[6vw] top-[-15%] rtl:right-auto rtl:left-[48%] overflow-hidden ml-[1.5vw] scale-0 duration-300 ease-out group-hover:scale-100 rounded-xl tablet:hidden">
                  <Image src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=500&auto=format&fit=crop" alt="Images" width={250} height={250} className="object-cover h-full w-full" />
                </div>
                <p className={`uppercase font-heading text-white group-hover:translate-x-[7vw] rtl:group-hover:translate-x-[-7.5vw] duration-300 text-[4.5vw] leading-[1] ease-out tablet:text-[5vw] tablet:group-hover:translate-x-0 rtl:tablet:group-hover:translate-x-0`}>
                  Luxury Projects
                </p>
              </div>
              <span className="w-full block h-[1px]  bg-white mobile:my-[7vw] tablet:my-[4vw]"></span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectHover;
