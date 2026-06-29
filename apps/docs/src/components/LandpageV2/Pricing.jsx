import React from 'react'

export default function Pricing() {
    return (
        <div className='h-fit text-background  flex pb-[6vw]! flex-col gap-[6vw] items-center justify-center min-h-screen pt-[80vh]! bg-foreground self-padd  w-full'>

            <div className=' text-center space-y-[4vw]'>
                <h2 className='text110 w-[70vw]'>Start free. Upgrade when you’re ready.</h2>
                <p className='text24'>The free core stays free, forever. Pro unlocks everything and every new drop.</p>
            </div>
            <div className='h-[50vw] w-full bg-zinc-900'></div>
            <p className='text34 relative z-50 text-center w-[45vw]'>Cancel anytime. The free core stays free forever. Every effect
                lives in your repo. So even if you leave, your
                code stays.</p>

        </div>
    )
}
