const { ArrowUpRightIcon } = require("@/utils/Icons");
const { default: Image } = require("next/image");

export default function VaultBox({ id, styles, img, number, label }) {
    return (
        <div
            id={id}
            className={`flex p-[1vw] overflow-hidden justify-between relative h-full rounded-md ${styles}`}
        >
            <div className='absolute inset-0 bg-black/50'>
                <Image src={img} alt='image' fill className='object-cover h-full w-full' />
            </div>
            <div className='relative z-2 flex justify-between h-full w-full'>
                <div className='text24 '>
                    <p>{number}</p>
                    <p>{label}</p>
                </div>
                <div className='size-[2vw] flex items-end'>
                    <ArrowUpRightIcon className={'h-full w-full object-contain'} />
                </div>
            </div>
        </div>
    )
}