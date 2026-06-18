import DraggableMarquee from "@/components/draggable-marquee";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";


const page = () => {
	return (
		<>
			<DemoHeader textColor="#ffffff" logoColor="#ffffff" />
			<DraggableMarquee/>
		</>
	);
};

export default page;
