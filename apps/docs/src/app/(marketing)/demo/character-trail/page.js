
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import CharacterTrail from '@/components/character-trail'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {

  return (
    <>
<LenisSmoothScroll />
<DemoHeader/>  
<CharacterTrail/>
    </>
  )
}

export async function generateMetadata() {
  return getDemoPageMetadata("character-trail");
}
