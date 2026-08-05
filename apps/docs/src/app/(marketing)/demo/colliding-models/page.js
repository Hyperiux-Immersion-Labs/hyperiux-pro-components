import CollidingModels from "@/components/colliding-models";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <DemoHeader />
      <div className="fixed inset-0 h-screen w-screen bg-white flex flex-col overflow-hidden">
        <div className=" max-[1025px]:block w-[50%] mx-auto pt-24 max-[1025px]:mt-10  max-[1025px]:w-[80%] max-md:w-[90%] max-md:my-0">
          <h1 className="text-3xl max-md:text-2xl text-black text-center">
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

export async function generateMetadata() {
  return getDemoPageMetadata("colliding-models");
}
