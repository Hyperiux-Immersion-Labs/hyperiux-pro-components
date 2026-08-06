import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface HoverFillLinkOwnProps {
    href: string;
    children?: ReactNode;
    className?: string;
    isActive?: boolean;
}

type HoverFillLinkProps = HoverFillLinkOwnProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof HoverFillLinkOwnProps>;

export function HoverFillLink({ href, children, className = "", isActive, ...props }: HoverFillLinkProps) {
    const text = typeof children === "string" ? children : "";
    return (
        <>
            <Link
                href={href}
                data-content={text}
                data-active={isActive ? "true" : undefined}
                className={`relative inline-block overflow-hidden text-[rgba(255,255,255,0.92)] no-underline before:absolute before:inset-0 before:content-[attr(data-content)] before:text-(--color-primary) before:[clip-path:polygon(0_0,0_0,0_100%,0_100%)] before:transition-[clip-path] before:duration-300 before:ease-[ease] hover:before:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] focus-visible:before:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] data-[active=true]:before:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] ${className}`}
                {...props}
            >
                {children}
            </Link>

            <style jsx global>{`
                @media (prefers-reduced-motion: reduce) {
                    [data-content]::before {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}
