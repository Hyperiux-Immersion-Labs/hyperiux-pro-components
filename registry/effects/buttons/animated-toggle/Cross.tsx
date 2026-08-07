"use client"

export interface CrossProps {
    isActive?: boolean;
    size?: number;
    prefersReducedMotion?: boolean;
    duration?: number;
    className?: string;
}

const Cross = ({
 isActive = false,
 size = 24,
 prefersReducedMotion = false,
 duration = 0.32,
 className ="",
}: CrossProps) => {
 return (
 <div
 className={`flex items-center relative justify-center motion-reduce:transition-none motion-safe:hover:rotate-180 motion-safe:group-hover:rotate-180 ${className}`}
 style={{
  width: size,
  height: size,
  transform: isActive ?'rotate(315deg)' :'rotate(180deg)',
  transitionProperty: 'transform',
  transitionDuration: prefersReducedMotion ? '0s' : `${duration}s`,
  transitionTimingFunction: 'ease-in-out',
 }}
 >
 <span
 className='absolute block w-full h-0.5 bg-current transition-transform ease-in-out motion-reduce:transition-none'
 style={{ transitionDuration: prefersReducedMotion ? '0s' : `${duration}s` }}
 />
 <span
 className='absolute block w-full h-0.5 bg-current transition-transform rotate-90 ease-in-out motion-reduce:transition-none'
 style={{ transitionDuration: prefersReducedMotion ? '0s' : `${duration}s` }}
 />
 </div>
 );
}

export default Cross
