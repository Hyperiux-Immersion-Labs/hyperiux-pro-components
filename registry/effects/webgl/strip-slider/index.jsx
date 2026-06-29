import React from'react'
import LenisSmoothScroll from'@/components/SmoothScroll/LenisScroll'
import StripSliderComp from './StripSliderComp';

const items = [
 {
 id:'item-0',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-01.jpg',
 text:'Nature 1',
 atlasIndex: 0,
 colors: ['#333','#aaa']
 },
 {
 id:'item-1',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-02.jpg',
 text:'Nature 2',
 atlasIndex: 1,
 colors: ['#333','#aaa']
 },
 {
 id:'item-2',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-03.jpg',
 text:'Nature 3',
 atlasIndex: 2,
 colors: ['#333','#aaa']
 },
 {
 id:'item-3',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-04.jpg',
 text:'Nature 4',
 atlasIndex: 3,
 colors: ['#333','#aaa']
 },
 {
 id:'item-4',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-05.jpg',
 text:'Nature 5',
 atlasIndex: 4,
 colors: ['#333','#aaa']
 },
 {
 id:'item-5',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-06.jpg',
 text:'Nature 6',
 atlasIndex: 5,
 colors: ['#333','#aaa']
 },
 {
 id:'item-6',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-07.jpg',
 text:'Nature 7',
 atlasIndex: 6,
 colors: ['#333','#aaa']
 },
 {
 id:'item-7',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-08.jpg',
 text:'Nature 8',
 atlasIndex: 7,
 colors: ['#333','#aaa']
 },
 {
 id:'item-8',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-09.jpg',
 text:'Nature 9',
 atlasIndex: 8,
 colors: ['#333','#aaa']
 },
 {
 id:'item-9',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/v-10.jpg',
 text:'Nature 10',
 atlasIndex: 9,
 colors: ['#333','#aaa']
 },
 {
 id:'item-10',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg',
 text:'Nature 11',
 atlasIndex: 10,
 colors: ['#333','#aaa']
 },
 {
 id:'item-11',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg',
 text:'Nature 12',
 atlasIndex: 11,
 colors: ['#333','#aaa']
 },
 {
 id:'item-12',
 url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-06.jpg',
 text:'Nature 13',
 atlasIndex: 12,
 colors: ['#333','#aaa']
 },
 {
 id:'item-13',
 url:'/https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg',
 text:'Nature 14',
 atlasIndex: 13,
 colors: ['#333','#aaa']
 },
 { id:'item-14', url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-08.jpg', text:'Image 1', atlasIndex: 14, colors: ['#333','#aaa'] },
 { id:'item-15', url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-09.jpg', text:'Image 2', atlasIndex: 15, colors: ['#333','#aaa'] },
 { id:'item-16', url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg', text:'Image 3', atlasIndex: 16, colors: ['#333','#aaa'] },
 { id:'item-17', url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-11.jpg', text:'Image 4', atlasIndex: 17, colors: ['#333','#aaa'] },
 { id:'item-18', url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-01.jpg', text:'Image 5', atlasIndex: 18, colors: ['#333','#aaa'] },
 { id:'item-19', url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-13.jpg', text:'Image 6', atlasIndex: 19, colors: ['#333','#aaa'] },
 { id:'item-20', url:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-14.jpg', text:'Image 7', atlasIndex: 20, colors: ['#333','#aaa'] },
];

const StripSlider = () => {
 return (
 <div className="w-full h-screen bg-black">
 <LenisSmoothScroll />
 <StripSliderComp items={items} />
 </div>
 )
}

export default StripSlider
