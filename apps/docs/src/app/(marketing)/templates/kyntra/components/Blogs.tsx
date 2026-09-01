// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SmoothInfiniteCarousel, {
  type KeyboardSlider,
} from "./smooth-carousel/SmoothInfiniteCarousel";
import CarouselNavButtons from "./Buttons/NavButtons";
import CharStaggerPrimaryButton from "./effects/char-stagger-primary-button";
import CharStaggerButton from "./effects/char-stagger-button";
import blog1 from "../assets/blogs/blog1.png";
import blog2 from "../assets/blogs/blog2.png";
import blog3 from "../assets/blogs/blog3.png";
import blog4 from "../assets/blogs/blog4.png";
import blog5 from "../assets/blogs/blog5.png";

import FocusTextWrap from "./effects/focus-text/wrap";
import { FadeUp, ParaAnim } from "./Animations/gsapAnim";
type Article = {
  title: string;
  date: string;
  href: string;
  image: StaticImageData;
};

const ARTICLES: Article[] = [
  {
    title: "Why Your AC Usually Warns You Before It Fails",
    date: "09 July 2026",
    href: "#",
    image: blog1,
  },
  {
    title: "The Quiet Cost of Skipping Seasonal Maintenance",
    date: "22 June 2026",
    href: "#",
    image: blog2,
  },
  {
    title: "What a Well-Run Home Actually Looks Like",
    date: "14 June 2026",
    href: "#",
    image: blog3,
  },
  {
    title: "Small Repairs That Prevent Expensive Ones",
    date: "02 June 2026",
    href: "#",
    image: blog4,
  },
  {
    title: "Reading the Signals Your House Is Sending",
    date: "19 May 2026",
    href: "#",
    image: blog5,
  },
];

const ArticleCard = ({ article }: { article: Article }) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;

      const content = panel.querySelectorAll<HTMLElement>("[data-panel-item]");
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(panel, { yPercent: 100 });
      gsap.set(content, { autoAlpha: 0, y: 16 });

      // Panel slides up first, then the content staggers in after it lands.
      const tl = gsap.timeline({ paused: true });
      tl.to(panel, {
        yPercent: 0,
        duration: reduced ? 0 : 0.35,
        ease: "power3.inOut",
      }).to(
        content,
        {
          autoAlpha: 1,
          y: 0,
          duration: reduced ? 0 : 0.4,
          stagger: reduced ? 0 : 0.08,
          ease: "power2.out",
        },
        reduced ? 0 : ">-0.1",
      );

      tlRef.current = tl;
    },
    { scope: cardRef },
  );

  const handleEnter = () => tlRef.current?.play();
  const handleLeave = () => tlRef.current?.reverse();

  return (
    <article
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocusCapture={handleEnter}
      onBlurCapture={handleLeave}
      className="group relative h-[34vw] w-[30vw] shrink-0 overflow-hidden rounded-[1.4vw] max-[1025px]:h-[52vw] max-[1025px]:w-[42vw] max-md:h-[110vw] max-md:w-[82vw] max-md:rounded-[4vw]"
    >
      <Image
        src={article.image}
        alt={article.title}
        fill
        draggable={false}
        sizes="(max-width: 768px) 82vw, (max-width: 1024px) 42vw, 24vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Blurred panel: slides up on hover, then its content fades in. */}
      <div
        ref={panelRef}
        className="absolute inset-x-0 bottom-0 rounded-t-lg bg-black/40 px-[1.8vw] py-[1.6vw] backdrop-blur-md max-md:px-[6vw] max-md:py-[6vw]"
      >
        <h3
          data-panel-item
          className="w-[90%] text-30 leading-[1.2] font-normal text-white max-[1025px]:text-[3vw] max-md:text-[6vw]"
        >
          {article.title}
        </h3>
        <p
          data-panel-item
          className="text-18 mt-[0.9vw] text-white/70 max-[1025px]:text-[1.8vw] max-md:mt-[3vw] max-md:text-[3.6vw]"
        >
          {article.date}
        </p>
        <div data-panel-item>
          <CharStaggerButton
            text="Read Article"
            href={article.href}
            showLine
            hoverColor="rgba(255,255,255,0.7)"
            className="mt-[1.4vw] text-white max-md:mt-[5vw]"
            textClassName=" text-22 tracking-tight max-[1025px]:text-[1.8vw] max-md:text-[3.6vw]"
            iconClassName="text-white"
          />
        </div>
      </div>
    </article>
  );
};

const Blogs = () => {
  const sliderRef = useRef<KeyboardSlider | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const check = () => {
      const slider = sliderRef.current;
      if (!slider) return;

      const { target, maxScroll } = slider;
      // A pixel of slack: `target` eases toward its bound and lands fractions
      // short, which would otherwise leave a button live at the very end.
      const EPS = 1;
      setAtStart(target >= -EPS);
      setAtEnd(maxScroll >= -EPS ? true : target <= maxScroll + EPS);
    };

    check();
    gsap.ticker.add(check);
    return () => gsap.ticker.remove(check);
  }, []);

  const carouselConfig = useMemo(
    () => ({
      infinite: false,
      snap: false,
      // Drag and the nav buttons only — the wheel/trackpad must not move the
      // strip while the page scrolls past this section.
      wheelInput: false,
      setOffset: ({ wrapperWidth }: { wrapperWidth: number }) => {
        const wrapperEl = sliderRef.current?.wrapper;
        if (!wrapperEl) return wrapperWidth;

        const cs = getComputedStyle(wrapperEl);
        const paddingLeft = parseFloat(cs.paddingLeft || "0");
        const paddingRight = parseFloat(cs.paddingRight || "0");
        const gap = parseFloat(cs.columnGap || "0");
        const itemCount = wrapperEl.children.length;

        return (
          wrapperWidth -
          paddingRight -
          paddingLeft -
          Math.max(0, itemCount - 1) * gap
        );
      },
    }),
    [],
  );

  return (
    <section className="relative w-full overflow-hidden bg-white py-[7%] text-black max-[1025px]:py-[10%]">
      <div className="px-[5%]">
        {/* Heading + copy */}
        <FocusTextWrap>
          <h2 className="font-helvetica-neue w-[55vw] text-[3.8vw] leading-[1.1] font-normal tracking-[-0.02em] max-[1025px]:max-w-full max-[1025px]:text-[6vw] max-md:text-[9vw]">
            Notes from People Who Spend their Days Inside Homes
          </h2>
        </FocusTextWrap>
        <ParaAnim
          as="p"
          className="text-24 mt-[1.6vw] max-w-[30vw] leading-[1.6] text-black max-[1025px]:mt-[3vw] max-[1025px]:max-w-full max-[1025px]:text-[2.6vw] max-md:text-[4vw]"
        >
          Practical Perspectives On Maintenance, Ownership And The Systems
          Behind A Well-Run Home.
        </ParaAnim>
      </div>

      <div className="mt-[4vw] flex items-stretch gap-[3vw] pl-[5%] max-[1025px]:mt-[8vw] max-[1025px]:flex-col max-[1025px]:gap-[6vw]">
        <div className="flex w-[24%] pb-[2vw] shrink-0 flex-col justify-between  max-[1025px]:w-full max-[1025px]:flex-row max-[1025px]:items-center max-[1025px]:py-0 max-[1025px]:pr-[5%]">
          <FadeUp className="w-fit">
            <CharStaggerPrimaryButton
              text="All Articles"
              href="#"
              hoverColor="#ffffff"
              showArrow
              className="w-fit rounded-full bg-[#134BD6] px-[1.8vw] py-[0.7vw] text-white max-[1025px]:px-6 max-[1025px]:py-3"
              textClassName=" text-22 tracking-tight max-[1025px]:text-[2.4vw] max-md:text-[3.6vw]"
              iconClassName="text-white"
            />
          </FadeUp>

          <FadeUp className="w-fit" delay={0.1}>
            <CarouselNavButtons
              onPrev={() => sliderRef.current?.goToPrev()}
              onNext={() => sliderRef.current?.goToNext()}
              prevDisabled={atStart}
              nextDisabled={atEnd}
            />
          </FadeUp>
        </div>

        <FadeUp className="min-w-0 flex-1">
          <SmoothInfiniteCarousel
            config={carouselConfig}
            wrapperClassName="pr-[5%] pb-[1vw] gap-[1.5vw] max-md:gap-[4vw]"
            itemClassName="cursor-grab active:cursor-grabbing"
            onReady={(slider) => {
              sliderRef.current = slider;
            }}
          >
            {ARTICLES.map((article) => (
              <ArticleCard key={article.title} article={article} />
            ))}
          </SmoothInfiniteCarousel>
        </FadeUp>
      </div>
    </section>
  );
};

export default Blogs;
