"use client"

export interface PlusProps {
    isActive?: boolean;
    size?: number;
    prefersReducedMotion?: boolean;
    duration?: number;
    className?: string;
}

const Plus = ({
 isActive = false,
 size = 24,
 prefersReducedMotion = false,
 duration = 0.32,
 className ="",
}: PlusProps) => {
 return (
 <div
 className={`flex items-center relative justify-center motion-reduce:transition-none motion-safe:hover:rotate-180 motion-safe:group-hover:rotate-180 ${className}`}
 style={{
  width: size,
  height: size,
  transform: isActive ?'rotate(180deg)' :'rotate(0deg)',
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
 className='absolute block w-full h-0.5 bg-current transition-transform ease-in-out motion-reduce:transition-none'
 style={{
   transform: isActive ?'rotate(180deg)' :'rotate(90deg)',
   transitionDuration: prefersReducedMotion ? '0s' : `${duration}s`,
 }}
 />
 </div>
 );
}

export default Plus
