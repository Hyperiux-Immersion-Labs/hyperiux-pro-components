// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

type Listener = () => void;

export const intro = { assemble: 0, done: false };

const listeners = new Set<Listener>();

export function onIntroDone(cb: Listener) {
  if (intro.done) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function finishIntro() {
  intro.assemble = 1;
  if (intro.done) return;
  intro.done = true;
  document.documentElement.classList.add("ord-ready");
  listeners.forEach((cb) => cb());
  listeners.clear();
}
