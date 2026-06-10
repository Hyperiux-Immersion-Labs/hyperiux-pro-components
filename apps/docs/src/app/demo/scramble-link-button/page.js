import { ScrambleLinkButton } from "@/components/scramble-link-button";
import Image from "next/image";

export default function Page() {
    return (
        
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
                        stepMs={50}
                        className="text-[2vw] max-sm:text-[4.5vw]"
                    />
                </div>
            </div>



            <div className="fixed inset-0">
                <Image
                    src="/assets/buttonbg/bg03.png"
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
    
    );
}
