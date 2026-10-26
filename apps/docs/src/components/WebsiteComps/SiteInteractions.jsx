"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import InteractionProvider, {
    useInteraction,
} from "@/homepage/components/InteractionProvider";
import { readSoundPreference } from "@/homepage/components/SoundToggle";
import { EasterEggProvider } from "@/homepage/components/easter-egg/EasterEgg";
import SiteCursor from "@/components/WebsiteComps/SiteCursor";
import { useIdle } from "@/lib/when-idle";


const SiteBackground = dynamic(
    () => import("@/homepage/components/SiteBackground"),
    { ssr: false },
);

// The fluid background is decoration: it starts once the page has loaded, so its first
// allocation and frames don't compete with the hero's paint and hydration. Its own
// component, so only it re-renders when the page goes idle.
function IdleSiteBackground() {
    return useIdle() ? <SiteBackground /> : null;
}

const SHOWCASE_PREFIXES = ["/demo", "/template-demo"];

const matchesPrefix = (path, prefixes) =>
    Boolean(path) &&
    prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));


function ResumeSavedSound() {
    const { setSound } = useInteraction();

    useEffect(() => {
        if (readSoundPreference() !== true) return;

        const onFirstGesture = (e) => {
           
            if (e.target?.closest?.("[data-sound-toggle]")) return;
            removeListeners();
            setSound(true);
        };
        // Only these count as a user gesture that may start audio. A touch's
        // pointerdown doesn't (phones only allow it once the finger lifts), so
        // listening for it left mobile silent after a reload.
        const EVENTS = ["touchend", "click", "keydown"];
        const removeListeners = () => {
            EVENTS.forEach((type) => window.removeEventListener(type, onFirstGesture, true));
        };

        EVENTS.forEach((type) => window.addEventListener(type, onFirstGesture, true));
        return removeListeners;
    }, [setSound]);

    return null;
}


export default function SiteInteractions({ children }) {
    const pathname = usePathname();
    const isShowcase = matchesPrefix(pathname, SHOWCASE_PREFIXES);

    return (
        <InteractionProvider uiSounds={!isShowcase}>
            {!isShowcase && <IdleSiteBackground />}
            {!isShowcase && <ResumeSavedSound />}
            {!isShowcase && <SiteCursor />}
            {isShowcase ? children : <EasterEggProvider>{children}</EasterEggProvider>}
        </InteractionProvider>
    );
}
