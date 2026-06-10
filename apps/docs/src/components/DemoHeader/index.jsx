
'use client'
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import CharStaggerLinkBtn from"@/components/Buttons/LinkButtons/CharStaggerLinkBtn/CharStaggerLinkBtn";

const DEFAULT_LOGO = {
  alt: "Hyperiux",
  width: 30,
  height: 30,
};

export default function DemoHeader({
  logo = DEFAULT_LOGO,
  logoColor = "#1a1a1a",
  text = "Browse effects",
  textColor = "#1a1a1a",
  textIcon = SquareArrowOutUpRight,
  showTextIcon = true,
  href = "/effects",
  showLogo = true,
  showText = true,
}) {
  const TextIcon = textIcon;

  const renderLogo = () => {
    if (React.isValidElement(logo)) {
      return logo;
    }

    const { alt, width, height } = {
      ...DEFAULT_LOGO,
      ...logo,
    };

    return (
      <span
        aria-label={alt}
        role="img"
        className="inline-flex shrink-0"
        style={{ color: logoColor }}
      >
      <svg 
       width={width}
          height={height}
       viewBox="0 0 58 65" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 0H9.02977V28.5943H0V0Z" fill="currentColor"/>
<path d="M57.1895 64.7134H48.1597V36.1192H57.1895V64.7134Z" fill="currentColor"/>
<path d="M0.0195312 36.1192V64.7135H9.0493V42.139L21.5405 37.4737V28.7449L0.0195312 36.1192Z" fill="currentColor"/>
<path d="M48.1777 22.5746V0.00012207H57.3579V28.5944L34.332 37.8697V28.5944L48.1777 22.5746Z" fill="currentColor"/>
<path d="M21.9912 29.0459L28.4868 26.8346C28.8573 26.7085 29.2624 26.7316 29.6161 26.8992L34.7834 29.3469M21.9912 29.0459L28.1616 32.2063M21.9912 29.0459V37.1727L28.1616 40.0321M34.7834 29.3469L28.1616 32.2063M34.7834 29.3469C34.7834 32.3443 34.7834 34.1753 34.7834 37.1727L28.1616 40.0321M28.1616 32.2063V40.0321" stroke="currentColor" strokeWidth="0.902977"/>
</svg>

      </span>
    );
  };

  const resolvedTextColor = showLogo && showText ? textColor : logoColor;

  return (
    <>
      <span className="pointer-events-none fixed left-0 top-0 z-10 block h-0 w-full bg-transparent " />

      <header className="fixed left-0 top-0 z-20 w-full px-6 py-4 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {showLogo ? (
              <Link
                href="/"
                className="inline-flex items-center"
                aria-label="Go to homepage"
              >
                {renderLogo()}
              </Link>
            ) : null}
          </div>

          <div className="min-w-0 text-right">
            {showText ? (
              <CharStaggerLinkBtn
                href={href}
                text={text}
                hoverColor={resolvedTextColor}
                showArrow={showTextIcon}
                icon={TextIcon}
                iconVariant="single"
                className="inline-flex items-center gap-2 text-sm font-medium tracking-wide transition-opacity duration-200 sm:text-base"
                textClassName="text-sm font-medium tracking-wide sm:text-base"
                style={{ color: resolvedTextColor }}
              />
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
