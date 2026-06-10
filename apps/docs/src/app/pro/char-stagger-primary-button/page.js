import CharStaggerPrimaryBtn from"@/components/Buttons/PrimaryButtons/CharStaggerPrimaryBtn/CharStaggerPrimaryBtn";
import { ButtonDemoShell } from"@/components/Buttons/ButtonDemoShell";

export default function Page() {
 return (
 <ButtonDemoShell
 title="Character Stagger Primary Button"
 backgroundSrc="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-06.jpg"
 >
 <CharStaggerPrimaryBtn
 href="#"
 text="Hover me"
 bgClassName="rounded-full bg-[#ff6b00]"
 className="text-[1.2vw] max-sm:text-[4.5vw]"
 />
 </ButtonDemoShell>
 );
}
