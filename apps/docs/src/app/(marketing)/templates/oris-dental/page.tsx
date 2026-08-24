import OrisNav from "@/templates/oris-dental/components/OrisNav";
import OrisHero from "@/templates/oris-dental/sections/OrisHero";
import "@/templates/oris-dental/components/oris-dental.css";
import OrisWrapper from "@/templates/oris-dental/components/OrisWrapper";
import AboutOris from "@/templates/oris-dental/sections/AboutOris";



export default function page() {
    return (
        <OrisWrapper>
            <OrisNav />
            <OrisHero />
            <div className="z-10 relative">
                <AboutOris />
            </div>
        </OrisWrapper>
    )
}
