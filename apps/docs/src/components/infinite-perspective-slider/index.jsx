import { InfinitePerspectiveSliderComp } from "./InfinitePerspectiveSliderComp";

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
export default function InfinitePerspectiveSlider() {
    
    return (
        <>
            <div className=" bg-white h-screen flex flex-col justify-center gap-20">
                <div className="w-full px-[7vw] flex flex-col gap-[1vw] text-[#111111] items-center text-center">
                    <h1 className="text-[5vw] max-sm:lg:text-[7vw] max-sm:text-[11vw]">
                        Infinite Perspective Slider
                    </h1>
                    <p>
                        scroll for the perspective effect and hover on the cards for the card detail
                    </p>

                </div>
                <InfinitePerspectiveSliderComp images={images} />
            </div>
        </>
    );
}
