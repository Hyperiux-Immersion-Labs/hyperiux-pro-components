import React from 'react'

export default function Preview() {
    return (
        <section id="preview" className="h-screen w-full">
            <h2 className="t96 font-neue-haas text-center">
                Preview. Install. Tune. Ship.
            </h2>
            <div className="h-screen relative mt-[4vw] border-t border-b border-grey w-full flex flex-col">

                {/* Row: Preview */}
                <div className="flex flex-1 border-b border-grey">
                    <div className="w-[15vw] h-full border-r border-grey"></div>
                    <div className="w-[15vw] h-full border-r border-grey"></div>
                    <div className="flex-1 flex flex-col justify-center px-[4vw] gap-[1vw] border-r border-grey">
                        <p className="text34">Preview</p>
                        <p className="t22 w-[80%]">
                            Browse by the moment you need: a sharper scroll, a cursor with presence, a cleaner transition. See exactly what it does before it touches your project.
                        </p>
                    </div>
                    <div className="w-[15vw] h-full"></div>
                </div>

                {/* Row: Install */}
                <div className="flex flex-1 border-b border-grey">
                    <div className="w-[15vw] h-full border-r border-grey"></div>
                    <div className="w-[15vw] h-full border-r border-grey"></div>
                    <div className="flex-1 flex flex-col justify-center px-[4vw] gap-[1vw] border-r border-grey">
                        <p className="text34">Install</p>
                        <p className="t22 w-[80%]">
                            Use the Honyaku CLI to add only the effect you need. Vault adds only the files that effect needs, not a full interaction ocean. You can inspect and own the implementation.
                        </p>
                    </div>
                    <div className="w-[15vw] h-full"></div>
                </div>

                {/* Row: Tune */}
                <div className="flex flex-1 border-b border-grey">
                    <div className="w-[15vw] h-full border-r border-grey"></div>
                    <div className="w-[15vw] h-full border-r border-grey"></div>
                    <div className="flex-1 flex flex-col justify-center px-[4vw] gap-[1vw] border-r border-grey">
                        <p className="text34">Tune</p>
                        <p className="t22 w-[80%]">
                            Edit copy, layout, timing, easing, breakpoints, hover states, mobile fallbacks and reduced-motion behavior to match your brand and product.
                        </p>
                    </div>
                    <div className="w-[15vw] h-full"></div>
                </div>

                {/* Row: Ship */}
                <div className="flex flex-1">
                    <div className="w-[15vw] h-full border-r border-grey"></div>
                    <div className="w-[15vw] h-full border-r border-grey"></div>
                    <div className="flex-1 flex flex-col justify-center px-[4vw] gap-[1vw] border-r border-grey">
                        <p className="text34">Ship</p>
                        <p className="t22 w-[80%]">
                            Deploy a website that feels abstract, more noticeable, and more memorable, without rebuilding every interaction from scratch.
                        </p>
                    </div>
                    <div className="w-[15vw] h-full"></div>
                </div>

            </div>
        </section>
    )
}
