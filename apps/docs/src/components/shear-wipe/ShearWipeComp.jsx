'use client'
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';

const ShearWipeComp = ({
  componentHighlights = [],
  showcaseStats = [],
  componentsBg = 'bg-[#C7D3C0]',
  componentsTextColor = 'text-black',
  showcaseBg = 'bg-[#8FA28A]',
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

  // Animate panel open/close
  useEffect(() => {
    if (overlayRef.current) {
      if (activePanel === 'showcase') {
        gsap.to(overlayRef.current, {
          clipPath: 'polygon(7.75% 0%, 100% 0%, 100% 100%, 11.25% 100%)',
          duration: 1.2,
          ease: 'power3.inOut',
        });
      } else {
        gsap.to(overlayRef.current, {
          clipPath: 'polygon(92.5% 0%, 100% 0%, 100% 100%, 88.5% 100%)',
          duration: 1.2,
          ease: 'power3.inOut',
        });
      }
    }
  }, [activePanel]);

  // --- Hover animations ---
  const handleHover = (side) => {
    if (!overlayRef.current) return;

    if (side === 'showcase' && activePanel === 'components') {
      gsap.to(overlayRef.current, {
        clipPath: 'polygon(90% 0%, 100% 0%, 100% 100%, 86% 100%)',
        duration: 0.6,
        ease: 'power2.out',
      });
    }

    if (side === 'components' && activePanel === 'showcase') {
      gsap.to(overlayRef.current, {
        clipPath: 'polygon(10.5% 0%, 100% 0%, 100% 100%, 14% 100%)',
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  };

  const handleHoverOut = () => {
    if (!overlayRef.current) return;

    if (activePanel === 'showcase') {
      gsap.to(overlayRef.current, {
        clipPath: 'polygon(7.75% 0%, 100% 0%, 100% 100%, 11.25% 100%)',
        duration: 0.6,
        ease: 'power2.inOut',
      });
    } else {
      gsap.to(overlayRef.current, {
        clipPath: 'polygon(92.5% 0%, 100% 0%, 100% 100%, 88.5% 100%)',
        duration: 0.6,
        ease: 'power2.inOut',
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

    if (activeTabEl && activeLineRef.current) {
      gsap.to(activeLineRef.current, {
        x: activeTabEl.offsetLeft,
        width: activeTabEl.offsetWidth,
        duration: 0.45,
        ease: 'power3.out',
      });
    }

    const showEl = activePanel === 'components' ? componentsContentRef.current : showcaseContentRef.current;
    const hideEl = activePanel === 'components' ? showcaseContentRef.current : componentsContentRef.current;

    if (!showEl || !hideEl) return;

    gsap.killTweensOf([showEl, hideEl]);

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
    <div className={`relative w-full min-h-screen ${componentsBg} overflow-hidden`}>
 
      <div className="max-[1025px]:hidden relative w-full h-screen px-[10vw]">
        {/* Base Panel - Components */}
        <div className="flex h-full items-center">
          {/* Left Content */}
          <div className="w-[40%] flex items-start justify-start p-[6vw]">
            <div className={`max-w-[45vw] space-y-[3vw] ${componentsTextColor}`}>
              <h2 className="text-[2.5vw] font-display leading-[1.2]">Design that feels alive</h2>
              <p className="text-[1.1vw] leading-relaxed">
                Every component in Hyperiux Vault is built to react, transition, and guide attention naturally — making interfaces feel intentional instead of static. Bold ideas, flawless execution, unforgettable impact.
              </p>
            </div>
          </div>

          {/* Right Content */}
          <div className="w-[60%] flex items-center justify-center p-[5vw]">
            <div className={`w-full pt-[5vw] space-y-[2vw] ${componentsTextColor}`}>
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
          className={`absolute inset-0 ${showcaseBg} pointer-events-auto px-[10vw]`}
          style={{
            clipPath: 'polygon(92.5% 0%, 100% 0%, 100% 100%, 88.5% 100%)',
          }}
        >
          <div className="flex h-screen relative">
            {/* Left Content */}
            <div className="w-[40%] flex items-center justify-center pl-[6vw]">
              <div className={showcaseTextColor}>
                <h2 className="text-[2.5vw] font-display mb-[3vw] leading-[1.2]">Motion with meaning</h2>
                <p className="text-[1.1vw] leading-relaxed">
                  Animations should explain, not distract. Interactions are designed to create clarity, rhythm, and confidence across every screen — trusted by teams shipping real products, not just prototypes.
                </p>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 flex items-center justify-center p-[6vw]">
              <div className={`w-full max-w-[30vw] grid grid-cols-2 gap-x-[3vw] gap-y-[3vw] ${showcaseTextColor}`}>
                {showcaseStats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-[2.4vw] font-display leading-none">{stat.value}</div>
                    <div className="text-[0.8vw] uppercase tracking-wider mt-[0.6vw]">{stat.label}</div>
                  </div>
                ))}
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
              Every component in Hyperiux Vault is built to react, transition, and guide attention naturally — making interfaces feel intentional instead of static. Bold ideas, flawless execution, unforgettable impact.
            </p>

            <div className="space-y-[3.5vw] max-md:space-y-[6vw]">
              {componentHighlights.map((item, i) => (
                <div key={i} className="flex items-start gap-[2.5vw] max-md:gap-[3.5vw] border-b border-black/15 pb-[3.5vw] max-md:pb-[5vw]">
                  <span className={`text-[1.8vw] max-md:text-[3.2vw] ${componentsTextColor} opacity-45 pt-[0.2vw]`}>{item.label}</span>
                  <div>
                    <h3 className={`text-[2.4vw] max-md:text-[4.4vw] font-display leading-tight ${componentsTextColor}`}>{item.title}</h3>
                    <p className={`text-[1.8vw] max-md:text-[3.4vw] leading-relaxed ${componentsTextColor} opacity-60 mt-[1vw] max-md:mt-[1.8vw]`}>{item.desc}</p>
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
              Animations should explain, not distract. Interactions are designed to create clarity, rhythm, and confidence across every screen — trusted by teams shipping real products, not just prototypes.
            </p>

            <div className="grid grid-cols-2 gap-x-[6vw] gap-y-[6vw] max-md:gap-x-[8vw] max-md:gap-y-[8vw]">
              {showcaseStats.map((stat, i) => (
                <div key={i}>
                  <div className={`text-[4.6vw] max-md:text-[8vw] font-display leading-none ${componentsTextColor}`}>{stat.value}</div>
                  <div className={`text-[1.6vw] max-md:text-[3vw] uppercase tracking-wider ${componentsTextColor} opacity-60 mt-[1.5vw] max-md:mt-[2.5vw]`}>{stat.label}</div>
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
