// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Cursor = dynamic(() => import("./Cursor"), { ssr: false });
const LenisSmoothScroll = dynamic(() => import("./LenisSmoothScroll"), { ssr: false });
const SoundController = dynamic(() => import("../Sound/SoundController"), { ssr: false });

const DeferredEffects = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setReady(true), { timeout: 1500 } as IdleRequestOptions);
    return () => cancel(id);
  }, []);

  if (!ready) return null;

  return (
    <>
      <LenisSmoothScroll />
      <SoundController />
      <Cursor />
    </>
  );
};

export default DeferredEffects;
