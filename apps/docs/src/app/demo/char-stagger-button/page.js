import CharStaggerLinkBtn from"@/components/Buttons/LinkButtons/CharStaggerLinkBtn/CharStaggerLinkBtn";
import { ButtonDemoShell } from"@/components/Buttons/ButtonDemoShell";

export default function Page() {
 return (
 <ButtonDemoShell
 title="Character Stagger Button"
 backgroundSrc="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg"
 >
 <CharStaggerLinkBtn
 href="#"
 showLine
 text="Hover me"
 hoverColor="#ff6b00"
 className="text-[2vw] max-sm:text-[4.5vw]"
 />
 </ButtonDemoShell>
 );
}
