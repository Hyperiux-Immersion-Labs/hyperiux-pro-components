import React from 'react'

export default function SpiralImages() {
    return (
        <section className='h-[200vh] bg-background relative w-full'>
            <div className='sticky flex items-center justify-center top-0 h-screen w-full'>
                <div className='relative h-full w-full'>
                    <div className='absolute h-full w-full inset-0 '>
                        <svg
                            className='h-full scale-150 rotate-90 w-full'
                            viewBox="0 0 400 400"
                            width="100%"
                            height="100%"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M165.865 345C67.4268 338.855 27.5031 77.085 213.503 69.1662C405.382 60.997 340.806 357.21 197.786 260.179C147.022 225.723 192.405 137.4 241.736 158.785"
                                stroke="#000000"
                                strokeOpacity="0.9"
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                  
                    </div>

                    {/* <div className='bg-white h-[12vw] rounded-md w-[20vw] flex items-center justify-center'>

                    </div> */}
                </div>
            </div>
        </section>
    )
}
