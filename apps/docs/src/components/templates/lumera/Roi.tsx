import React from "react";
import styles from "./styles.module.css";

const Roi = () => {
  return (
    <>
      <section className="pt-[3%] pb-[10%] mobile:pb-[20%]" id="roi">
        <div className={`${styles["container-lg"]} flex justify-between mobile:flex-col mobile:gap-[7vw]`}>
          <h2 data-para-anim className={`${styles["title-2"]} w-[40%] mobile:w-full`}>
            Built for Long-Term Value
          </h2>
          <p data-para-anim className="w-[45%] mobile:w-full">
            Thoughtful design decisions today translate into lasting value and lower upkeep for years to come.
          </p>
        </div>
      </section>
    </>
  );
};

export default Roi;
