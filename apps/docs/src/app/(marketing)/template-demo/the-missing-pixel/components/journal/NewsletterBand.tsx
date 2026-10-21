// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useState, type SyntheticEvent } from "react";
import { FadeUp } from "../Animations/gsapAnim";
import PixelButton from "../Buttons/PixelButton";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const NewsletterBand = () => {
  const [message, setMessage] = useState("");

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("email") as HTMLInputElement | null;
    if (!input || !EMAIL_PATTERN.test(input.value.trim())) {
      setMessage("Enter a valid email address, like name@studio.com.");
      input?.focus();
      return;
    }
    setMessage("Subscribed. The next issue lands on the first Thursday of the month.");
    event.currentTarget.reset();
  };

  return (
    <FadeUp className="flex items-center justify-between gap-9 rounded-3xl bg-[#0a0a0a] px-[4.4vw] py-[4.4vw] text-[#f5f5f5] max-lg:flex-col max-lg:items-start max-lg:gap-8 max-lg:px-[5vw] max-lg:py-[5vw] max-md:px-[8vw] max-md:py-[8vw]">
      <div className="flex w-[64%] flex-col gap-3 max-lg:w-full">
        <h2>One email a month. Zero filler.</h2>
        <p className="text-28 text-white/60">No tracking pixels. Yes, we see the irony.</p>
      </div>
      <div className="flex w-[30%] flex-col gap-3 max-lg:w-full">
        <form onSubmit={submit} noValidate className="flex items-center gap-3">
          <label htmlFor="mpx-journal-newsletter" className="sr-only">
            Email address
          </label>
          <input
            id="mpx-journal-newsletter"
            type="email"
            name="email"
            placeholder="Your email"
            autoComplete="email"
            className="h-[5vh] min-w-0 flex-1 rounded-full border border-white/30 bg-transparent px-[1.2vw] text-22 text-[#f5f5f5] outline-none transition-colors duration-300 placeholder:text-white/40 focus:border-[#f5f5f5] max-lg:h-[3.6vh] max-lg:px-[2.4vw] max-md:h-[5.8vh] max-md:px-[4vw]"
          />
          <PixelButton label="Subscribe" type="submit" size="sm" tone="dark" magnetic={0} />
        </form>
        <p aria-live="polite" className="text-14 text-white/60">
          {message}
        </p>
      </div>
    </FadeUp>
  );
};

export default NewsletterBand;
