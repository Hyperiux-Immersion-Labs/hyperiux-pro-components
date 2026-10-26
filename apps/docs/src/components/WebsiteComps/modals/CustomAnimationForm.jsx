"use client";

import { Suspense, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { whenIdle } from "@/lib/when-idle";

// Open/close state used to live in the URL (a ?custom-animation-form=open
// query param toggled via router.push), so triggering this globally-mounted
// modal from a heavy page (the effects vault, an effect detail page) forced
// a real Next.js navigation - re-running every useSearchParams() consumer
// on that page and, on routes that read searchParams server-side, a fresh
// RSC fetch - before the modal even started animating. Plain Context state
// makes open/close an instant local re-render instead, with no router
// involvement at all. Nothing else in the app reads or links to that query
// param (checked), so there's no deep-linking behavior being given up here.
//
// This file is the light part every page loads. The modal itself (its form, validation
// and animation) is ./CustomAnimationFormModal, loaded when the page is idle and shown
// on first open.
const CustomAnimationFormContext = createContext(null);

const loadModal = () => import("./CustomAnimationFormModal");
const CustomAnimationFormModal = dynamic(loadModal, { ssr: false });

export function CustomAnimationFormProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <CustomAnimationFormContext.Provider value={value}>
      {children}
    </CustomAnimationFormContext.Provider>
  );
}

export function useCustomAnimationFormModal() {
  const context = useContext(CustomAnimationFormContext);

  if (!context) {
    throw new Error(
      "CustomAnimationFormTrigger/Modal must be rendered within a CustomAnimationFormProvider"
    );
  }

  return {
    isOpen: context.isOpen,
    openCustomAnimationForm: context.open,
    closeCustomAnimationForm: context.close,
  };
}

function CustomAnimationFormTriggerInner({
  children = "Request Custom Animation",
  className = "",
}) {
  const { openCustomAnimationForm } = useCustomAnimationFormModal();

  return (
    <button
      id="custom-animation-form-modal-open-custom-animation-form"
      type="button"
      onClick={openCustomAnimationForm}
      className={className}
    >
      {children}
    </button>
  );
}

export function CustomAnimationFormTrigger(props) {
  return (
    <Suspense fallback={null}>
      <CustomAnimationFormTriggerInner {...props} />
    </Suspense>
  );
}

/**
 * The modal, mounted from the first time it opens (and kept, so it can animate out). Its
 * code is fetched when the page goes idle, so opening it is still instant.
 */
export function LazyCustomAnimationFormModal() {
  const { isOpen } = useCustomAnimationFormModal();
  const [wanted, setWanted] = useState(false);
  if (isOpen && !wanted) setWanted(true);

  useEffect(() => whenIdle(loadModal).cancel, []);

  return wanted ? <CustomAnimationFormModal /> : null;
}
