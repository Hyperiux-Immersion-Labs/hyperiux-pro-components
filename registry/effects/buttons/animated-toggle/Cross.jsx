"use client"

/**
 * @typedef {Object} CrossProps
 * @property {boolean} [isActive]
 * @property {number} [size]
 * @property {boolean} [prefersReducedMotion]
 * @property {string} [className]
 */

/** @param {CrossProps} props */
const Cross = ({
 isActive = false,
 size = 24,
 prefersReducedMotion = false,
 className ="",
}) => {
 return (
 <div
 className={`flex items-center relative justify-center duration-300 motion-reduce:transition-none motion-safe:hover:rotate-180 motion-safe:group-hover:rotate-180 ${className}`}
 style={{
  width: size,
  height: size,
  transform: isActive ?'rotate(315deg)' :'rotate(180deg)',
 }}
 >
 <span
 className='absolute block w-full h-0.5 bg-current transition-transform duration-300 ease-in-out motion-reduce:transition-none'
 />
 <span
 className='absolute block w-full h-0.5 bg-current transition-transform rotate-90 duration-300 ease-in-out motion-reduce:transition-none'
 />
 </div>
 );
}

export default Cross
