import { ArrowFillButton } from "@/components/arrow-fill-button";
import Image from "next/image";
// import { ButtonDemoShell } from "@/components/Buttons/ButtonDemoShell";

export default function Page() {
    return (
        // <ButtonDemoShell
        //     title="Arrow Fill Button"
        //     backgroundSrc="/assets/buttonbg/image01.jpg"
        // >
        <div className="h-screen w-screen flex items-center justify-center relative">
            <div className="space-y-20 relative z-10 text-center -mt-20">
                <div className="space-y-4">
                    <p className="text-xs max-sm:text-sm max-md:text-base uppercase tracking-[0.4em] text-white/60">
                        Hyperiux Button Demo
                    </p>
                    <h1 className="text-5xl font-medium max-sm:text-4xl">Arrow Fill Button</h1>
                </div>

                <div className="">
                    <ArrowFillButton
                        className="bg-[#ff6b00] scale-150"
                        href="#"
                        btnText="Hover me"
                    />
                </div>
            </div>



            <div className="fixed inset-0">
                <Image
                    src="/assets/buttonbg/image01.jpg"
                    alt="bg image"
                    title="Arrow Fill Button"
                    className="h-full w-full object-cover"
                    width={1920}
                    height={1080}
                    priority
                />
                <div className="absolute inset-0 bg-black/70" />
            </div>
        </div>
        // </ButtonDemoShell>
    );
}
