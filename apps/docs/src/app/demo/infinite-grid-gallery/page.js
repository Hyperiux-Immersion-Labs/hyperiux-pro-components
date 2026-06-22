import { InfiniteGridGallery } from "@/components/infinite-grid-gallery";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";

const page = () => {
  return (
    <>
    <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
      <InfiniteGridGallery />
    </>
  );
};

export default page;
