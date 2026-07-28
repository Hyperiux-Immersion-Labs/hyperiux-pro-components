
import CardDriftComp from './CardDriftComp'

const CardDrift = ({
  data = testimonials,
  bgColor = "bg-black",
  bgTextColor = "text-white/70",
  cardBg = "bg-indigo-600",
  cardTextColor = "text-white",
  barBg = "bg-neutral-800",
}) => {
  return (
   <CardDriftComp
 data={data}
 bgColor={bgColor}
 bgTextColor={bgTextColor}
 cardBg={cardBg}
 cardTextColor={cardTextColor}
 barBg={barBg}
 />
  )
}

export default CardDrift

const testimonials = [
 {
 year:"2024",
 tag:"PRODUCT",
 text:"Hyperiux drops interface experiences that feel faster than thought.",
 },
 {
 year:"2024",
 tag:"DESIGN",
 text:"Hyperiux blends motion, interaction, and storytelling into next-gen UI systems.",
 },
 {
 year:"2025",
 tag:"TECH",
 text:"Hyperiux is redefining how users feel digital products, not just use them.",
 },
 {
 year:"2025",
 tag:"COMPONENTS",
 text:"Hyperiux pushes the boundaries of immersive web experiences.",
 },
 {
 year:"2025",
 tag:"BLOG",
 text:"From micro-interactions to full-scale motion systems, Hyperiux builds interfaces that hit different.",
 },
];