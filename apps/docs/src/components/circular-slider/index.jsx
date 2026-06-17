import React from 'react'
import CircularSliderComp from './CircularSliderComp';

const CircularSlider = () => {
  return (
   <CircularSliderComp data={data} heading="Interfaces that react."
 para="Built for motion, crafted for experience."/>
  )
}

export default CircularSlider

const data = [
 {
 heading:"Arrow Fill Button",
 text:"Primary button with an expanding fill and animated arrow ",
 bgColor:"#655A7C",
 textColor:"#2A2433",
 },
 {
 heading:"Custom Cursor",
 text:"Interactive cursor that transforms every hover",
 bgColor:"#AB92BF",
 textColor:"#3D2E50",
 },
 {
 heading:"Text Scramble",
 text:"Dynamic text reveal with glitch-style transitions",
 bgColor:"#AFC1D6",
 textColor:"#2C3E52",
 },
 {
 heading:"Hover Reveal Card",
 text:"Cards that come alive on hover interaction",
 bgColor:"#CEF9F2",
 textColor:"#1A5C53",
 },
 {
 heading:"Scroll Animations",
 text:"Smooth GSAP-powered scroll-based animations",
 bgColor:"#D6CA98",
 textColor:"#4A3F1A",
 },
 {
 heading:"Circular Slider",
 text:"Rotating card slider with immersive motion",
 bgColor:"#655A7C",
 textColor:"#2A2433",
 },
];
