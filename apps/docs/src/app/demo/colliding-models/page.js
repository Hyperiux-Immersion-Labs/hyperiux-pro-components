import CollidingModels from "@/components/colliding-models";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

const page = () => {
  return (
    <>
      <DemoHeader />
      <div className="fixed inset-0 h-screen w-screen bg-white flex flex-col overflow-hidden">
        <div className=" max-md:block w-[50%] mx-auto pt-20 max-md:mt-10  max-md:w-[80%] max-sm:w-[90%]">
          <h1 className="text-3xl max-sm:text-2xl text-black text-center">
            We build 3D visual experiences and interactive web worlds that help
            bold brands stand apart
          </h1>
        </div>
        <CollidingModels />
      </div>
    </>
  );
};

export default page;
