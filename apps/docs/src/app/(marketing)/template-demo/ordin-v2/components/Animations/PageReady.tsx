// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect } from "react";
import { finishIntro } from "./intro";

// Pages without the boot loader mark the intro as done straight away, so the header and hero play in
export default function PageReady() {
  useEffect(() => {
    if ("scrollRestoration" in history && !location.hash) {
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }
    finishIntro();
  }, []);
  return null;
}
