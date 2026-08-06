import FileEncryption from "@/components/file-encryption";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";



export default function Page() {
  return (
    <>
    <DemoHeader textColor="#ffffff" logoColor='#FFFFFF' />
    <FileEncryption/>
    
    </>
   
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("file-encryption");
}
