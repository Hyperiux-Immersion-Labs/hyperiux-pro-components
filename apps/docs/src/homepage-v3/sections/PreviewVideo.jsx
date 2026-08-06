import LazyVideo from '@/components/WebsiteComps/LazyVideo'
import React from 'react'

const VIDEO_SRC = 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/tutorial.mp4'

export default function PreviewVideo() {
    return (
        <section className='h-screen mt-[20vw]  relative w-full'>
            <LazyVideo
                src={VIDEO_SRC}
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
            />
        </section>
    )
}
