import GridTunnel from'@/components/grid-tunnel';
import DemoHeader from '@/components/WebsiteComps/DemoHeader';
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom';
import React from'react'

const page = () => {
 return (
 <>
 <DemoHeader/>
 <GridTunnel/>
 <ScrollBottom textColor={"text-[#111111]"}/>
 </>
 )
}

export default page
