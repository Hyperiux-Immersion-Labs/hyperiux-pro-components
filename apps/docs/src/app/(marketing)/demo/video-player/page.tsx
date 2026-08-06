
import VideoPlayer from "@/components/video-player";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const featurePoints = [
  "Custom play, pause, mute, close, and progress controls",
  "Auto-hiding controls that reappear on hover, touch, or interaction",
  "Smooth seek bar with draggable timeline support",
  "Responsive control sizing across desktop, tablet, and mobile",
];

export default function Page() {
  return (
    <>
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />
      <section className="flex min-h-screen w-screen items-center max-[1025px]:items-start bg-[#111111] p-[5vw] max-[1025px]:h-auto max-[1025px]:py-[8vw] max-[1025px]:pt-24 max-md:pt-24 max-[1025px]:pb-[8vw] max-md:px-[5vw] max-md:py-[12vw]">
        <div className="flex w-full justify-between gap-[5vw] max-[1025px]:flex-col max-[1025px]:gap-[6vw] max-md:gap-[8vw]">
          {/* LEFT VIDEO */}
          <div className="aspect-video h-[27vw] w-[43vw] max-[1025px]:h-auto max-[1025px]:w-full fadeup">
            <VideoPlayer />
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex w-1/2 flex-col gap-[2vw] text-white max-[1025px]:w-full max-[1025px]:gap-[3vw]">
            <h1 className="text-[3vw] leading-[1.1] font-medium max-[1025px]:text-[6vw] max-md:text-[8.5vw]">
              <SplitLine>
                A Custom Video Player Built for Polished Interfaces
              </SplitLine>
            </h1>
            <SplitLine>
              <p className="w-[85%] text-[1.1vw] leading-[1.8] opacity-80 max-[1025px]:w-full max-[1025px]:text-[2.2vw] max-md:text-[3.8vw] max-md:leading-[1.7]">
                This video player gives you a clean, cinematic playback experience
                without relying on the browser’s default controls. It handles
                play, pause, mute, progress tracking, seeking, poster support,
                autoplay behavior, and optional close actions inside a fully
                styled interface.
              </p>
            </SplitLine>


            <ul className="flex list-none flex-col gap-[0.5vw] p-0 text-[1vw] opacity-80 max-[1025px]:gap-[1vw] max-[1025px]:text-[2vw] max-md:gap-[2vw] max-md:text-[3.5vw] max-md:pl-[2vw]">
              {featurePoints.map((point) => (

                <li key={point} className="flex gap-[0.35em]">
                  <SplitLine>
                    <span> • {point}</span>
                  </SplitLine>
                </li>

              ))}
            </ul>
          </div>
        </div>
      </section>

    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("video-player");
}
