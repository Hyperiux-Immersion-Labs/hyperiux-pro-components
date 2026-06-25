import React from'react'
import SpotlightText from'@/components/spotlight-text'

const page = () => {
 return (
 <>
 <div className="h-screen flex flex-col items-center mx-auto justify-center gap-8 bg-black">
 <p className="text-center text-sm font-medium uppercase tracking-[0.35em] text-white/40 max-sm:px-6 max-sm:text-[10px]">
 Sweep your cursor across the words and let the spotlight find them
 </p>
 <SpotlightText
 text={`Hyperiux Vault is where design meets precision - a thoughtfully crafted component library built for developers who care about performance, aesthetics, and experience. Every interaction is intentional, every animation feels alive, and every component is designed to elevate modern interfaces beyond the ordinary.`}
 size="text-3xl"
 className="max-w-4xl mx-auto max-sm:w-[80%]"
/>
 </div>
 </>
 )
}

export default page
