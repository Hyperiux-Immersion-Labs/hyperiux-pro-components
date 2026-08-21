import Image from "next/image";
import ElenaVossLogo from "./assets/elena-voss.svg";
import DotFillBtn from "./effects/dot-fill-button/DotFillButton";

const Header = () => {
  return (
    <>
      <header
        className="w-screen h-fit py-[1.5vw] flex items-center justify-between px-[4vw] fixed inset-0 backdrop-blur-lg z-99 max-[1025px]:py-[3vw] max-[1025px]:px-[5vw] max-md:py-4 max-md:px-5"
        id="header"
      >
        <div>
          <Image
            src={ElenaVossLogo}
            width={338}
            height={172}
            alt="Logo"
            loading="lazy"
            className="w-[12vw] max-[1025px]:w-[20vw] max-md:w-[34vw]"
          />
        </div>
        <DotFillBtn
          btnText="Get in Touch"
          href={"#"}
          textClassName="font-normal text-[1.15vw] max-[1025px]:text-[3vw] max-md:text-[4.2vw]"
          bgColor="#ffffff"
          dotColor="#ff5f00"
          hoverTextColor="#ffffff"
          textColor="#111111"
        />
      </header>
    </>
  );
};

export default Header;
