import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VaultBox({ id, styles, img, number, label, containerLink = '#', labelLink = '#', textColor = 'text-foreground', title = "WebGL Slider", paragraph = "For immersive product, portfolio, or campaign visuals." }) {
    const router = useRouter();

    return (
        <div
            id={id}
            onClick={() => router.push(containerLink)}
            className={`cursor-pointer group flex p-[1vw] z-999 overflow-hidden max-sm:min-h-[30vh] justify-between relative h-full max-sm:rounded-sm rounded-md ${styles} ${id=="block-bottom-layer-3"?"bg-[#3059FF]":""}`}
        >
            <div className={`absolute inset-0 bg-black/50 ${id=="block-bottom-layer-3"?"top-[12%]":""}`}>
                <video
                    loop
                    autoPlay
                    playsInline
                    muted
                    preload='auto'
                    src={img}
                    className={`object-cover  h-full w-full`}
                />
            </div>

            <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 max-sm:min-h-[32vh] to-transparent z-1 pointer-events-none! max-sm:rounded-sm opacity-0 max-sm:opacity-100 group-hover:opacity-100 transition-all duration-500'></div>

            <div className='relative z-2 flex flex-col justify-between h-full w-full'>
                <Link href={labelLink} onClick={(e) => e.stopPropagation()} className='text18 w-fit relative z-100 px-[1vw] py-[.5vw] max-sm:px-5 max-sm:py-2.5 rounded-full bg-grey h-fit opacity-0 max-sm:opacity-100 hover:bg-foreground hover:text-background group-hover:opacity-100 transition-all duration-500'>
                    <p>{label}</p>
                </Link>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500  max-sm:opacity-100 max-sm:space-y-[4vw]">
                    <p className="text34 max-sm:text-[5.5vw]!">{title}</p>
                    <p className="text-sm max-sm:text-[3.7vw] max-sm:leading-[1.2]">{paragraph}</p>
                </div>
            </div>
        </div>
    )
}