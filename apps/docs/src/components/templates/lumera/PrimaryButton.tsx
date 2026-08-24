import Link from "next/link";
import styles from "./styles.module.css";

interface PrimaryButtonProps {
  link: string;
  btnText: string;
  className?: string;
}

const PrimaryButton = ({ link, btnText, className = "" }: PrimaryButtonProps) => {
  return (
    <Link href={link} className={`${styles.btn} ${className}`}>
      <span data-primary className="btn-text">
        {btnText}
      </span>
      <div aria-hidden="true" className={styles["btn-circle"]}>
        <div className={styles["btn-circle-text"]}>
          {btnText}
          <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles["btn-icon"]}>
            <path data-v-f4363f2a fillRule="evenodd" clipRule="evenodd" d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z" className={`${styles["btn-path"]} fill-current`} />
            <path data-v-f4363f2a fillRule="evenodd" clipRule="evenodd" d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z" className={`${styles["btn-path"]} fill-current`} />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default PrimaryButton;
