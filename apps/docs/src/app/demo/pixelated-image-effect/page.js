

import PixelatedImageEffect from "@/components/pixelated-image-effect";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

export default function Page() {
 return (
    <>
    <DemoHeader logoColor="#ffffff" textColor="#ffffff"/>
 <PixelatedImageEffect
 src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-02.jpg"
 alt="Pixelated nature scene"
 />
 </>
 );
}
