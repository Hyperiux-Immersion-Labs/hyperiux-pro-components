import InertiaImage from "@/components/inertia-img";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const Page = () => {
    return (
        <>
            <DemoHeader textColor="#ffffff" logoColor="#ffffff" />
        <main className="h-screen overflow-hidden max-sm:min-h-screen max-sm:h-full max-sm:overflow-visible w-full bg-black px-10 py-12 text-white max-md:px-6">
            <div className="mx-auto flex w-full flex-col gap-10 max-sm:gap-14">
                <div className="max-w-2xl mx-auto text-center pt-10">
                    <h1 className="text-xl max-md:text-3xl max-sm:text-2xl uppercase tracking-[0.35em] text-white/75">
                        Inertia Image
                    </h1>
                    <p className="text-white/50 mt-0 max-md:mt-8 max-sm:mt-2 hidden max-md:block max-md:text-xl  max-sm:text-base max-sm:pt-2 max-sm:mx-6 max-sm:leading-[1.2] ">
                        Tap on the image try it.
                       <span className="block mt-2 max-md:w-60 max-sm:w-50 mx-auto text-center">

                         Hover on desktop to see what it was truly made for.
                       </span>
                    </p>
                </div>

                
 <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none max-sm:bottom-4 max-md:hidden">
 <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 text-sm font-medium tracking-wide">
 Interact to unwind & let momentum take over
 </div>
 </div>

 <div
   aria-live="polite"
   className="pointer-events-none fixed bottom-5 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center  backdrop-blur-sm max-md:hidden"
 >
   <h2 className="text-sm leading-none text-white">
     The image keeps drifting.
   </h2>
   <p className="mt-2 text-xs leading-5 text-white/65">
     Inertia Image moves with simulated momentum from your cursor or touch.
     Because the physics is the effect, reduced motion can&apos;t be
     honored here.
   </p>
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
