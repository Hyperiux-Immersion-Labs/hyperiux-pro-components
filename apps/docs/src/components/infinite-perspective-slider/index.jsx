import { InfinitePerspectiveSliderComp } from "./InfinitePerspectiveSliderComp";


export default function InfinitePerspectiveSlider() {
    
    return (
        <>
            <div className=" bg-white h-screen  pt-8 max-[1025px]:pt-20 max-md:gap-10 max-[1025px]:gap-20 max-[1025px]:justify-start flex flex-col justify-start gap-8">
                <div className="w-full px-[7vw] flex flex-col pt-15 max-[1025px]:pt-10 gap-[1vw] text-[#111111] items-center text-center">
                    <h1 className="text-[5vw] leading-[1.2]  max-[1025px]:text-[7vw] max-md:text-[11vw]">
                        Infinite Perspective Slider
                    </h1>
                    <p className="text-base max-md:text-sm">
                        <span className="max-md:hidden">
                            Scroll for the perspective effect and hover on the cards for the card detail
                        </span>
                        <span className="hidden max-md:inline">
                            Drag the slider and click on the images to reveal the info
                        </span>
                    </p>

                </div>
                <InfinitePerspectiveSliderComp images={images} />
            </div>
        </>
    );
}

const images = [
        {
            number: '01',
            src: 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-01.jpg',
            title: 'INSPIRE (JAN)',
            desc: 'Exploring nature and calm beginnings',
        },
        {
            number: '02',
            src: 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg',
            title: 'INSPIRE (FEB)',
            desc: 'Moments of stillness and beauty',
        },
        {
            number: '03',
            src: 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg',
            title: 'INSPIRE (MAR)',
            desc: 'Textures, light and motion',
        },
        {
            number: '04',
            src: 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg',
            title: 'INSPIRE (APR)',
            desc: 'Flowing forms and soft tones',
        },
        {
            number: '05',
            src: 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-06.jpg',
            title: 'INSPIRE (MAY)',
            desc: 'Warmth, depth and perspective',
        },
        {
            number: '06',
            src: 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg',
            title: 'INSPIRE (JUNE)',
            desc: 'Energy, waves and movement',
        },
        {
            number: '07',
            src: 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-08.jpg',
            title: 'DISTORT',
            desc: 'Abstract visuals and distortion',
        },
        {
            number: '08',
            src: 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-09.jpg',
            title: 'FRAME 01',
            desc: 'Captured cinematic frame',
        },
        {
            number: '09',
            src: 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg',
            title: 'FRAME 02',
            desc: 'Light and contrast study',
        },
        {
            number: '10',
            src: 'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-11.jpg',
            title: 'FRAME 03',
            desc: 'Minimal composition',
        },
    ];
