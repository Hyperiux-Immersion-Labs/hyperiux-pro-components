// Built using Hyperiux Vault: https://vault.hyperiux.com

'use client'
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

const ShearWipeComp = ({
  componentHighlights = [],
  showcaseStats = [],
  clipPathDuration = 0.9,
  componentsBgImage = 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/abs3.png',
  componentsTextColor = 'text-black',
  showcaseBgImage = 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/abs4.png',
  showcaseTextColor = 'text-white',
}) => {
  const [activePanel, setActivePanel] = useState('components');
  const overlayRef = useRef(null);

  const componentsTabRef = useRef(null);
  const showcaseTabRef = useRef(null);
  const activeLineRef = useRef(null);
  const componentsContentRef = useRef(null);
  const showcaseContentRef = useRef(null);
  const isFirstMobileRender = useRef(true);
  const isTransitioningRef = useRef(false);
  const isFirstPanelEffect = useRef(true);

  // Animate panel open/close
  useEffect(() => {
    if (isFirstPanelEffect.current) {
      isFirstPanelEffect.current = false;
      return;
    }

    if (overlayRef.current) {
      const targetClipPath =
        activePanel === 'showcase'
          ? 'polygon(7.75% 0%, 100% 0%, 100% 100%, 11.25% 100%)'
          : 'polygon(92.5% 0%, 100% 0%, 100% 100%, 88.5% 100%)';

      if (prefersReducedMotion()) {
        gsap.set(overlayRef.current, { clipPath: targetClipPath, pointerEvents: 'auto' });
        isTransitioningRef.current = false;
        return;
      }

      isTransitioningRef.current = true;
      gsap.set(overlayRef.current, { pointerEvents: 'none' });

      gsap.to(overlayRef.current, {
        clipPath: targetClipPath,
        duration: clipPathDuration,
        ease: 'power3.inOut',
        overwrite: 'auto',
        onComplete: () => {
          isTransitioningRef.current = false;
          gsap.set(overlayRef.current, { pointerEvents: 'auto' });
        },
      });
    }
  }, [activePanel]);

  // --- Hover animations ---
  // Ignored while a swipe is mid-flight so hovering the opposite edge can't
  // hijack the clip-path tween that's already running.
  const handleHover = (side) => {
    if (!overlayRef.current || isTransitioningRef.current || prefersReducedMotion()) return;

    if (side === 'showcase' && activePanel === 'components') {
      gsap.to(overlayRef.current, {
        clipPath: 'polygon(90% 0%, 100% 0%, 100% 100%, 86% 100%)',
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    if (side === 'components' && activePanel === 'showcase') {
      gsap.to(overlayRef.current, {
        clipPath: 'polygon(10.5% 0%, 100% 0%, 100% 100%, 14% 100%)',
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const handleHoverOut = () => {
    if (!overlayRef.current || isTransitioningRef.current || prefersReducedMotion()) return;

    if (activePanel === 'showcase') {
      gsap.to(overlayRef.current, {
        clipPath: 'polygon(7.75% 0%, 100% 0%, 100% 100%, 11.25% 100%)',
        duration: 0.6,
        ease: 'power2.inOut',
        overwrite: 'auto',
      });
    } else {
      gsap.to(overlayRef.current, {
        clipPath: 'polygon(92.5% 0%, 100% 0%, 100% 100%, 88.5% 100%)',
        duration: 0.6,
        ease: 'power2.inOut',
        overwrite: 'auto',
      });
    }
  };

  // Position the tab underline + set initial panel visibility on mount
  useLayoutEffect(() => {
    const activeTabEl = activePanel === 'components' ? componentsTabRef.current : showcaseTabRef.current;

    if (activeTabEl && activeLineRef.current) {
      gsap.set(activeLineRef.current, {
        x: activeTabEl.offsetLeft,
        width: activeTabEl.offsetWidth,
      });
    }

    gsap.set(componentsContentRef.current, {
      display: activePanel === 'components' ? 'block' : 'none',
      opacity: activePanel === 'components' ? 1 : 0,
    });

    gsap.set(showcaseContentRef.current, {
      display: activePanel === 'showcase' ? 'block' : 'none',
      opacity: activePanel === 'showcase' ? 1 : 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate the tab underline + crossfade the tab content on change
  useEffect(() => {
    if (isFirstMobileRender.current) {
      isFirstMobileRender.current = false;
      return;
    }

    const activeTabEl = activePanel === 'components' ? componentsTabRef.current : showcaseTabRef.current;
    const reducedMotion = prefersReducedMotion();

    if (activeTabEl && activeLineRef.current) {
      if (reducedMotion) {
        gsap.set(activeLineRef.current, {
          x: activeTabEl.offsetLeft,
          width: activeTabEl.offsetWidth,
        });
      } else {
        gsap.to(activeLineRef.current, {
          x: activeTabEl.offsetLeft,
          width: activeTabEl.offsetWidth,
          duration: 0.45,
          ease: 'power3.out',
        });
      }
    }

    const showEl = activePanel === 'components' ? componentsContentRef.current : showcaseContentRef.current;
    const hideEl = activePanel === 'components' ? showcaseContentRef.current : componentsContentRef.current;

    if (!showEl || !hideEl) return;

    gsap.killTweensOf([showEl, hideEl]);

    if (reducedMotion) {
      gsap.set(hideEl, { display: 'none', opacity: 0 });
      gsap.set(showEl, { display: 'block', opacity: 1 });
      return;
    }

    gsap.to(hideEl, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(hideEl, { display: 'none' });
        gsap.set(showEl, { display: 'block', opacity: 0 });

        gsap.to(showEl, {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        });
      },
    });
  }, [activePanel]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Page Background */}
      <div className="absolute inset-0">
        <img src={componentsBgImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/50" />
      </div>

      <div className="max-[1025px]:hidden relative w-full h-screen px-[10vw]">
        {/* Base Panel - Components */}
        <div className="flex h-full items-center">
          <div className="w-full flex items-center justify-center p-[6vw]">
            <div className={`w-[45vw] space-y-[3vw] ${componentsTextColor}`}>
              <h2 className="text-[2.5vw] font-display leading-[1.2] whitespace-nowrap">Design that feels alive</h2>
              <p className="text-[1.1vw] leading-relaxed">
                Every component reacts and transitions naturally , turning interfaces from static to alive.
              </p>
              <div className={`w-full pt-[2vw] space-y-[2vw] ${componentsTextColor}`}>
                {componentHighlights.map((item, i) => (
                  <div key={i} className="flex items-start gap-[1.5vw] border-b border-gray-400/40 pb-[1.5vw]">
                    <span className="text-[0.9vw] pt-[0.2vw]">{item.label}</span>
                    <div>
                      <h3 className="text-[1.2vw] font-display leading-tight">{item.title}</h3>
                      <p className="text-[0.95vw] leading-relaxed mt-[0.4vw]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Text on Right Edge */}
          <div
            className="absolute right-[-10%] top-1/2 -translate-y-1/2 cursor-pointer z-50"
            onMouseEnter={() => handleHover('showcase')}
            onMouseLeave={() => handleHoverOut('showcase')}
            onClick={() => setActivePanel('showcase')}
          >
            <div className="text-[7vw] font-medium leading-none tracking-tight origin-center rotate-90 whitespace-nowrap text-white">
              Showcase
            </div>
          </div>
        </div>

        {/* Overlay Panel - Showcase */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-auto px-[10vw]"
          style={{
            clipPath: 'polygon(92.5% 0%, 100% 0%, 100% 100%, 88.5% 100%)',
          }}
        >
          <div className="absolute inset-0">
            <img src={showcaseBgImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="flex h-screen items-center relative">
            <div className="w-full flex items-center justify-center p-[6vw]">
              <div className={`w-[45vw] space-y-[3vw] ${showcaseTextColor}`}>
                <h2 className="text-[2.5vw] font-display leading-[1.2]">Motion with meaning</h2>
                <p className="text-[1.1vw] leading-relaxed">
                  Animations explain, creating clarity and confidence across every screen.
                </p>

                <div className="pt-[2vw] space-y-[2vw]">
                  {showcaseStats.map((item, i) => (
                    <div key={i} className="flex items-start gap-[1.5vw] border-b border-white/20 pb-[1.5vw]">
                      <span className="text-[0.9vw] pt-[0.2vw] opacity-60">{item.label}</span>
                      <div>
                        <h3 className="text-[1.2vw] font-display leading-tight">{item.title}</h3>
                        <p className="text-[0.95vw] leading-relaxed mt-[0.4vw] opacity-80">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Edge Label */}
        <div
          className="absolute left-[-15%] top-1/2 -translate-y-1/2 cursor-pointer z-50"
          onMouseEnter={() => handleHover('components')}
          onMouseLeave={() => handleHoverOut('components')}
          onClick={() => setActivePanel('components')}
        >
          <div className="text-[7vw] font-medium leading-none tracking-tight origin-center -rotate-90 whitespace-nowrap text-white">
            Components
          </div>
        </div>

        {/* Creative clue hint */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none max-[1025px]:hidden">
          <div className="px-4 py-2 rounded-full bg-black/10 backdrop-blur-md  text-neutral-800 text-sm font-medium tracking-wide">
            Click either heading : Components or Showcase , to switch panels
          </div>
        </div>
      </div>


      <div className="hidden max-[1025px]:block px-[6vw] max-md:px-[6vw] pt-[16vw] pb-[10vw] max-md:pt-[26vw] max-md:pb-[14vw]">
        <div role="tablist" aria-orientation="horizontal" className="relative flex gap-[6vw] max-md:gap-[7vw] border-b border-black/15">
          <button
            ref={componentsTabRef}
            role="tab"
            type="button"
            aria-selected={activePanel === 'components'}
            onClick={() => setActivePanel('components')}
            className={`pb-[2vw] max-md:pb-[3.5vw] text-[2.4vw] max-md:text-[5vw] font-medium leading-none transition-colors duration-300 ease-in-out ${
              activePanel === 'components' ? 'text-black' : 'text-black/35'
            }`}
          >
            Components
          </button>
          <button
            ref={showcaseTabRef}
            role="tab"
            type="button"
            aria-selected={activePanel === 'showcase'}
            onClick={() => setActivePanel('showcase')}
            className={`pb-[2vw] max-md:pb-[3.5vw] text-[2.4vw] max-md:text-[5vw] font-medium leading-none transition-colors duration-300 ease-in-out ${
              activePanel === 'showcase' ? 'text-black' : 'text-black/35'
            }`}
          >
            Showcase
          </button>

          <span ref={activeLineRef} className="absolute bottom-0 left-0 h-[0.2vw] max-md:h-[0.6vw] bg-black" />
        </div>

        <div className="relative mt-[8vw] max-md:mt-[10vw]">
          {/* Components tab content */}
          <div ref={componentsContentRef}>
            <h2 className={`text-[4.2vw] max-md:text-[7.5vw] font-display leading-[1.15] ${componentsTextColor} mb-[3vw] max-md:mb-[5vw]`}>
              Design that feels alive
            </h2>
            <p className={`text-[2.1vw] max-md:text-[4vw] leading-relaxed ${componentsTextColor} opacity-70 mb-[6vw] max-md:mb-[9vw]`}>
              Every component reacts and transitions naturally , turning interfaces from static to alive.
            </p>

            <div className="space-y-[3.5vw] max-md:space-y-[6vw]">
              {componentHighlights.map((item, i) => (
                <div key={i} className="flex items-start gap-[2.5vw] max-md:gap-[3.5vw] border-b border-black/15 pb-[3.5vw] max-md:pb-[5vw]">
                  <span className={`text-[1.8vw] max-md:text-[3.2vw] ${componentsTextColor} opacity-45 pt-[0.2vw]`}>{item.label}</span>
                  <div className="flex items-baseline gap-[1.5vw] max-md:gap-[2vw]">
                    <h3 className={`text-[2.4vw] max-md:text-[4.4vw] font-display leading-tight whitespace-nowrap ${componentsTextColor}`}>{item.title}</h3>
                    <p className={`text-[1.8vw] max-md:text-[3.4vw] leading-relaxed ${componentsTextColor} opacity-60`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Showcase tab content */}
          <div ref={showcaseContentRef} className="absolute inset-0">
            <h2 className={`text-[4.2vw] max-md:text-[7.5vw] font-display leading-[1.15] ${componentsTextColor} mb-[3vw] max-md:mb-[5vw]`}>
              Motion with meaning
            </h2>
            <p className={`text-[2.1vw] max-md:text-[4vw] leading-relaxed ${componentsTextColor} opacity-70 mb-[7vw] max-md:mb-[10vw]`}>
              Animations explain, creating clarity and confidence across every screen.
            </p>

            <div className="space-y-[3.5vw] max-md:space-y-[6vw]">
              {showcaseStats.map((item, i) => (
                <div key={i} className="flex items-start gap-[2.5vw] max-md:gap-[3.5vw] border-b border-black/15 pb-[3.5vw] max-md:pb-[5vw]">
                  <span className={`text-[1.8vw] max-md:text-[3.2vw] ${componentsTextColor} opacity-45 pt-[0.2vw]`}>{item.label}</span>
                  <div className="flex items-baseline gap-[1.5vw] max-md:gap-[2vw]">
                    <h3 className={`text-[2.4vw] max-md:text-[4.4vw] font-display leading-tight whitespace-nowrap ${componentsTextColor}`}>{item.title}</h3>
                    <p className={`text-[1.8vw] max-md:text-[3.4vw] leading-relaxed ${componentsTextColor} opacity-60`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShearWipeComp;
