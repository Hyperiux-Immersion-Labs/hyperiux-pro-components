// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../Animations/reducedMotion";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type GroupContextValue = {
  openItems: string[];
  toggleItem: (id: string) => void;
};

type ItemContextValue = {
  isOpen: boolean;
  toggle: () => void;
  contentId: string;
  buttonId: string;
  outerRef: React.RefObject<HTMLDivElement | null>;
};

const GroupContext = createContext<GroupContextValue | null>(null);
const ItemContext = createContext<ItemContextValue | null>(null);

const useItem = () => {
  const context = useContext(ItemContext);
  if (!context) throw new Error("FAQTitle and FAQContent must be used inside FAQWrapper.");
  return context;
};

type FAQGroupProps = {
  children: ReactNode;
  allowMultiple?: boolean;
  defaultOpenItems?: string[];
};

export const FAQGroup = ({ children, allowMultiple = true, defaultOpenItems = [] }: FAQGroupProps) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpenItems);

  const toggleItem = useCallback(
    (id: string) => {
      setOpenItems((current) => {
        const isOpen = current.includes(id);
        if (allowMultiple) return isOpen ? current.filter((item) => item !== id) : [...current, id];
        return isOpen ? [] : [id];
      });
    },
    [allowMultiple],
  );

  const value = useMemo(() => ({ openItems, toggleItem }), [openItems, toggleItem]);

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

type FAQWrapperProps = {
  children: ReactNode;
  itemId?: string;
  className?: string;
  duration?: number;
};

export const FAQWrapper = ({ children, itemId, className = "", duration = 0.45 }: FAQWrapperProps) => {
  const group = useContext(GroupContext);
  const generatedId = useId();
  const id = itemId ?? generatedId;
  const [standaloneOpen, setStandaloneOpen] = useState(false);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);
  const contentId = useId();
  const buttonId = useId();

  const isOpen = group ? group.openItems.includes(id) : standaloneOpen;
  const toggle = () => (group ? group.toggleItem(id) : setStandaloneOpen((current) => !current));

  useIsomorphicLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    if (!mountedRef.current) {
      mountedRef.current = true;
      gsap.set(outer, { height: isOpen ? "auto" : 0 });
      return;
    }

    gsap.killTweensOf(outer);
    const tweenDuration = prefersReducedMotion() ? 0 : duration;
    const from = outer.offsetHeight;
    const to = isOpen ? outer.scrollHeight : 0;

    gsap.fromTo(
      outer,
      { height: from },
      {
        height: to,
        duration: tweenDuration,
        ease: "power3.out",
        onComplete: () => {
          if (isOpen) gsap.set(outer, { height: "auto" });
          ScrollTrigger.refresh();
        },
      },
    );
  }, [isOpen, duration]);

  const value = { isOpen, toggle, contentId, buttonId, outerRef };

  return (
    <ItemContext.Provider value={value}>
      <div className={className}>{children}</div>
    </ItemContext.Provider>
  );
};

type FAQTitleProps = {
  children: ReactNode;
  className?: string;
};

export const FAQTitle = ({ children, className = "" }: FAQTitleProps) => {
  const { isOpen, toggle, contentId, buttonId } = useItem();

  return (
    <button
      type="button"
      id={buttonId}
      aria-expanded={isOpen}
      aria-controls={contentId}
      onClick={toggle}
      className={`flex w-full cursor-pointer items-center justify-between gap-6 text-left ${className}`}
    >
      <span className="flex-1">{children}</span>
      <span
        aria-hidden
        className={`relative flex aspect-square h-[5.6vh] shrink-0 items-center justify-center rounded-full border transition-colors duration-500 max-lg:h-[4vh] max-md:h-[6vh] ${
          isOpen
            ? "border-[#0a0a0a] bg-[#0a0a0a] text-[#fafafa]"
            : "border-black/30 bg-transparent text-[#0a0a0a]"
        }`}
      >
        <span className="absolute h-px w-[0.9vw] bg-current max-lg:w-[1.6vw] max-md:h-0.5 max-md:w-[3.6vw]" />
        <span
          className={`absolute h-[0.9vw] w-px bg-current transition-transform duration-500 max-lg:h-[1.6vw] max-md:h-[3.6vw] max-md:w-0.5 ${
            isOpen ? "scale-y-0" : "scale-y-100"
          }`}
        />
      </span>
    </button>
  );
};

type FAQContentProps = {
  children: ReactNode;
  className?: string;
};

export const FAQContent = ({ children, className = "" }: FAQContentProps) => {
  const { outerRef, contentId, buttonId } = useItem();

  return (
    <div id={contentId} ref={outerRef} role="region" aria-labelledby={buttonId} className="h-0 overflow-hidden">
      <div className={className}>{children}</div>
    </div>
  );
};

export const AnimatedFAQ = {
  Group: FAQGroup,
  Wrapper: FAQWrapper,
  Title: FAQTitle,
  Content: FAQContent,
};

export type FAQItem = { question: string; answer: ReactNode };

type AnimatedFaqProps = {
  items: FAQItem[];
  allowMultiple?: boolean;
  defaultOpen?: number[];
};

const AnimatedFaq = ({ items, allowMultiple = true, defaultOpen = [0] }: AnimatedFaqProps) => {
  const defaultOpenItems = defaultOpen.map((index) => `faq-${index}`);

  return (
    <div className="flex flex-col mx-16 border-t border-black/10">
      <FAQGroup allowMultiple={allowMultiple} defaultOpenItems={defaultOpenItems}>
        {items.map((item, index) => (
          <FAQWrapper key={item.question} itemId={`faq-${index}`} className="border-b border-black/10">
            <FAQTitle className="font-mpx-head py-[1.6vw] text-30 font-medium max-lg:py-[3vw] max-md:py-[5vw]">
              {item.question}
            </FAQTitle>
            <FAQContent className="w-[70%] py-[1.2vw] text-28 text-mpx-muted max-lg:w-[90%] max-lg:py-[2.4vw] max-md:w-full max-md:py-[4vw]">
              {item.answer}
            </FAQContent>
          </FAQWrapper>
        ))}
      </FAQGroup>
    </div>
  );
};

export default AnimatedFaq;
