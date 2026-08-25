import OrisNav from "@/templates/oris-dental/components/OrisNav";
import OrisHero from "@/templates/oris-dental/sections/OrisHero";
import "@/templates/oris-dental/components/oris-dental.css";
import OrisWrapper from "@/templates/oris-dental/components/OrisWrapper";
import AboutOris from "@/templates/oris-dental/sections/AboutOris";
import DentalTreatments from "@/templates/oris-dental/sections/DentalTreatments";
import ParallaxSectionBreakOris from "@/templates/oris-dental/sections/ParallaxSectionBreakOris";
import OrisReviews from "@/templates/oris-dental/sections/OrisReviews";
import PassionMeetPurpose from "@/templates/oris-dental/sections/PassionMeetPurpose";
import OrisForm from "@/templates/oris-dental/sections/OrisForm";
import OrisFooter from "@/templates/oris-dental/sections/OrisFooter";
import OrisLoader from "@/templates/oris-dental/sections/OrisLoader";
import ScrollTopOnLoad from "@/homepage-v3/components/ScrollTopOnLoad";
import WhyOris from "@/templates/oris-dental/sections/WhyOris";

export default function page() {
    return (
        <OrisWrapper>
            <ScrollTopOnLoad />
            <OrisLoader />
            <OrisNav />
            <OrisHero />
            <div className="z-10 text-oris-secondary relative bg-white">
                <AboutOris />
                <DentalTreatments />
                <WhyOris />
                <ParallaxSectionBreakOris />
                <OrisReviews />
                <PassionMeetPurpose />
                <OrisForm />
            </div>
            <OrisFooter />
        </OrisWrapper>
    )
}
