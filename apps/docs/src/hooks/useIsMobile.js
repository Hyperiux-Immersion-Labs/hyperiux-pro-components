import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the device screen size is below a given breakpoint
 * and whether the component has successfully mounted on the client-side.
 * 
 * @param {number} breakpoint - Width breakpoint in pixels (defaults to 640 for Tailwind's 'sm' breakpoint)
 * @returns {object} { isMounted: boolean, isMobile: boolean }
 */
export default function useIsMobile(breakpoint = 640) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return { isMounted, isMobile };
}
