import DraggableMarquee from "@/components/draggable-marquee";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";



const page = () => {
	return (
		<>
			<DemoHeader textColor="#ffffff" logoColor='#FFFFFF' />
			<DraggableMarquee/>
		</>
	);
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("draggable-marquee");
}
