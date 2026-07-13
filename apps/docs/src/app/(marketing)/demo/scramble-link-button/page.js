import ScrambleLinkButton from "@/components/scramble-link-button";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import Image from "next/image";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {
    return (

        <>
        <DemoHeader textColor="#ffffff" logoColor="#ffffff" />
        
        <div className="h-screen w-screen flex items-center justify-center relative">
            <div className="space-y-20 relative z-10 text-center -mt-20">
                <div className="space-y-4">
                    <p className="text-xs max-sm:text-sm max-md:text-base uppercase tracking-[0.4em] text-white/60">
                        Hyperiux Button Demo
                    </p>
                    <h1 className="text-5xl font-medium max-sm:text-4xl">Scramble Link Button</h1>
                </div>

                <div className="">
                    <ScrambleLinkButton
                        href="#"
                        text="Hover me"
                        showLine={true}
                        stepMs={50}
                        className="text-[2vw] max-sm:text-[4.5vw]"
                    />
                </div>
            </div>



            <div className="fixed inset-0">
                <Image
                    src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg"
                    alt="bg image"
                    title="Scramble Link Button"
                    className="h-full w-full object-cover"
                    width={1920}
                    height={1080}
                    priority
                />
                <div className="absolute inset-0 bg-black/70" />
            </div>
        </div>
        </>
    
    );
}

export async function generateMetadata() {
  return getDemoPageMetadata("scramble-link-button");
}
