import DotScaleFillCharBtn from"@/components/Buttons/PrimaryButtons/DotBgFillPrimaryBtn/DotBgFillPrimaryBtn";
import { ButtonDemoShell } from"@/components/Buttons/ButtonDemoShell";

export default function Page() {
 return (
 <ButtonDemoShell
 title="Dot Fill Button"
 backgroundSrc="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg"
 >
 <DotScaleFillCharBtn
 href="#"
 btnText="Hover me"
 bgColor="#ff6b00"
 textColor="#ffffff"
 fillColor="#ffffff"
 hoverTextColor="#ff6b00"
 />
 </ButtonDemoShell>
 );
}
