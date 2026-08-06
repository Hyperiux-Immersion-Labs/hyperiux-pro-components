import InertiaImage from "@/components/inertia-img";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const Page = () => {
    return (
        <>
            <DemoHeader textColor="#ffffff" logoColor='#FFFFFF' />
        <main className="h-screen overflow-hidden max-md:min-h-screen max-md:h-full max-md:overflow-visible w-full bg-black px-10 py-12 text-white max-[1025px]:px-6">
            <div className="mx-auto flex w-full flex-col gap-10 max-md:gap-14">
                <div className="max-w-2xl mx-auto text-center pt-10">
                    <h1 className="text-xl max-[1025px]:text-3xl max-md:text-2xl uppercase tracking-[0.35em] text-white/75">
                        Inertia Image
                    </h1>
                    <p className="text-white/50 mt-0 max-[1025px]:mt-8 max-md:mt-2 hidden max-[1025px]:block max-[1025px]:text-xl  max-md:text-base max-md:pt-2 max-md:mx-6 max-md:leading-[1.2] ">
                        Tap on the image try it.
                       <span className="block mt-2 max-[1025px]:w-60 max-md:w-50 mx-auto text-center">

                         Hover on desktop to see what it was truly made for.
                       </span>
                    </p>
                </div>

                
 <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none max-md:bottom-4 max-[1025px]:hidden">
 <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 text-sm font-medium tracking-wide">
 Interact to unwind & let momentum take over
 </div>
 </div>

                <InertiaImage/>
            </div>
        </main>
         </>
    );
};

export default Page;

export async function generateMetadata() {
  return getDemoPageMetadata("inertia-img");
}
