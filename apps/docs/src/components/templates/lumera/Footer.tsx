import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";

const Footer = () => {
  return (
    <section id="footer" className="z-[5] footer-body">
      <div className={`${styles["container-lg"]} w-screen h-full rounded-t-[40px] overflow-hidden bg-[#E0D4C6] text-[#1C1B1A] mobile:py-[10%] tablet:pt-[5%]`}>
        <div className=" pt-[5%] pb-[2%] flex flex-col">
          {/* First Div */}
          <div className="w-full relative flex items-center justify-between mobile:flex-col-reverse mb-[7vw] mobile:gap-0">
            <div className="flex items-center justify-center gap-[1vw] mobile:gap-[3vw] mobile:mb-[5vw]">
              <Link href={"#"}>
                <div className="relative h-[3vw] w-[3vw] p-[0.5vw] flex items-center justify-center bg-[#1C1B1A] rounded-full overflow-hidden fadeup mobile:w-[10vw] mobile:h-[10vw] tablet:w-[5vw] tablet:h-[5vw]">
                  <Image
                    width={24}
                    height={24}
                    src="/assets/icons/facebook.svg"
                    alt="facebook-icon"
                  />
                </div>
              </Link>
              <Link href={"#"}>
                <div className="relative h-[3vw] w-[3vw] p-[0.5vw] flex items-center justify-center bg-[#1C1B1A] rounded-full overflow-hidden fadeup mobile:w-[10vw] mobile:h-[10vw] tablet:w-[5vw] tablet:h-[5vw] ">
                  <Image
                    width={24}
                    height={24}
                    src="/assets/icons/instagram.svg"
                    alt="instagram-icon"
                  />
                </div>
              </Link>
              <Link href={"#"}>
                <div className="relative h-[3vw] w-[3vw] p-[0.5vw] flex items-center justify-center bg-[#1C1B1A] rounded-full overflow-hidden fadeup mobile:w-[10vw] mobile:h-[10vw] mobile:p-[1vw] tablet:w-[5vw] tablet:h-[5vw]  ">
                  <Image
                    width={24}
                    height={24}
                    src="/assets/icons/linkedin.svg"
                    alt="linkedin-icon"
                  />
                </div>
              </Link>
              <Link href={"#"}>
                <div className="relative h-[3vw] w-[3vw] p-[0.5vw] flex items-center justify-center bg-[#1C1B1A] rounded-full overflow-hidden fadeup mobile:w-[10vw] mobile:h-[10vw] tablet:w-[5vw] tablet:h-[5vw] ">
                  <Image
                    width={24}
                    height={24}
                    src="/assets/icons/twitter.svg"
                    alt="twitter-icon"
                  />
                </div>
              </Link>
            </div>

            {/* Second Div */}
            <div className="flex items-center ml-[-12%] rtl:mr-[-12%] rtl:ml-0 justify-center w-[10vw] h-auto fadeup mobile:ml-0 mobile:w-[30vw] mobile:mb-[10vw] tablet:w-[20vw] tablet:ml-[-18%]">
              <Link href={"/"}>
                <Image
                  className="invert"
                  width={200}
                  height={50}
                  src="/assets/hogar-logo.svg"
                  alt="logo-img"
                />
              </Link>
            </div>

            {/* Third Div */}
            <a aria-label="Scroll Top" data-scroll data-scroll-to data-scroll-to-duration="3s" href="#hero">
              <div className="relative h-[3vw] w-[3vw] p-[0.5vw] flex items-center justify-center bg-[#1C1B1A] rounded-full overflow-hidden fadeup mobile:absolute mobile:top-[5%] mobile:right-[5%] mobile:w-[9vw] mobile:h-[9.2vw] tablet:w-[5vw] tablet:h-[5vw]">
                <Image
                  width={24}
                  height={24}
                  src="/assets/icons/CaretRight.svg"
                  alt="CaretRight-icon"
                />
              </div>
            </a>
          </div>

          <div className="flex items-center flex-col justify-center">
            <Link href="tel:+97180046427" className={`text-[3.4vw] font-medium ${styles["text-head"]} leading-none mobile:text-[5.5vw] tablet:text-[5vw]`}>
              <span data-para-anim className="">+971 800 46427</span>
            </Link>
            <Link href="mailto:info@hogarproperties.com">
              <p data-para-anim className={`text-[3.4vw] ${styles["text-head"]} font-medium mobile:text-[5.5vw] tablet:text-[5vw]`}>
                info@hogarproperties.com
              </p>
            </Link>
          </div>

          <div className="flex items-center justify-between tablet:flex-col mobile:gap-[5vw] fadeup pt-[7vw] tablet:gap-[3vw]">
            <div className="tablet:w-[70%] tablet:order-1">
              <p className="text-[1.1vw] uppercase mobile:text-[3.5vw] tablet:text-center tablet:text-[2.5vw]">
                Lumera Studio
              </p>
            </div>
            <div className="w-[35%] tablet:w-[80%] ml-[-5%] tablet:ml-0">
              <p className="text-[1.1vw] leading-[1.2] text-center mobile:text-[3.5vw] tablet:text-center tablet:text-[2.5vw]">
                Architecture and interior design for spaces that last.
              </p>
            </div>
            <Link href={"#"} className="tablet:order-3">
              <div>
                <p className="text-[1.1vw]  uppercase mobile:text-[3.2vw] mobile:text-center tablet:text-[2.5vw]">
                  Privacy Policy
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
