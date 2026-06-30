import CharStaggerButton from "@/components/char-stagger-button";
import Image from "next/image";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

export default function Page() {
    return (
        <>
            <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
        <div className="h-screen w-screen flex items-center justify-center relative">
            <div className="space-y-20 relative z-10 text-center -mt-20">
                <div className="space-y-4">
                    <p className="text-xs max-sm:text-sm max-md:text-base uppercase tracking-[0.4em] text-white/60">
                        Hyperiux Button Demo
                    </p>
                    <h1 className="text-5xl font-medium max-sm:text-4xl">Character Stagger Button</h1>
                </div>

                <div className="">
                    <CharStaggerButton
                        href="#"
                        showLine
                        text="Hover me"
                        hoverColor="#ff6b00"
                        className="text-[2vw] max-sm:text-[4.5vw] scale-150"
                    />
                </div>
            </div>



            <div className="fixed inset-0">
                <Image
                    src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg"
                    alt="bg image"
                    title="Character Stagger Button"
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
