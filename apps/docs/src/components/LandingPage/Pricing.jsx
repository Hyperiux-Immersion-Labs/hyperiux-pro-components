"use client";

import React, {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import SplitLine from "../WebsiteComps/SplitLine";
import RandomBlur from "../WebsiteComps/RandomBlur";
import WebsiteButton from "../WebsiteComps/Button";
import Input from "@/components/Form/Input";
import PhoneInput from "@/components/Form/PhoneInput";
import Textarea from "@/components/Form/Textarea";
import FormButton from "@/components/Form/Button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const MODAL_TRANSITION = {
    duration: 0.5,
    ease: [0.76, 0, 0.24, 1],
};

const PLAN_REQUEST_PARAM = "plan-request";
const PLAN_PARAM = "plan";

const INITIAL_FORM = {
    name: "",
    email: "",
    number: "",
    message: "",
};

const PRICING_PLAN_COUNTRIES = [
    { code: "IN", dial: "+91", flag: "🇮🇳", name: "India" },
    { code: "US", dial: "+1", flag: "🇺🇸", name: "United States" },
    { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom" },
    { code: "AE", dial: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
    { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada" },
    { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australia" },
    { code: "DE", dial: "+49", flag: "🇩🇪", name: "Germany" },
    { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
    { code: "SG", dial: "+65", flag: "🇸🇬", name: "Singapore" },
];

const PLANS = [
    {
        id: "free",
        name: "Free",
        subtext: "Start with the public Vault.",
        monthlyPrice: 0,
        current: true,
        cta: "Current Plan",
        features: [
            "Scroll systems",
            "Cursor interactions",
            "Text animation",
            "Navigation patterns",
            "Page transitions",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        subtext: "Premium effects, packs, and sections.",
        monthlyPrice: 19,
        yearlyPrice: 179,
        current: false,
        highlighted: true,
        cta: "Select Plan",
        features: [
            "Scroll systems",
            "Cursor interactions",
            "Text animation",
            "Navigation patterns",
            "Page transitions",
        ],
    },
    {
        id: "custom",
        name: "Custom",
        subtext: "For custom interaction builds.",
        monthlyPrice: 0,
        current: false,
        cta: "Select Plan",
        features: [
            "Scroll systems",
            "Cursor interactions",
            "Text animation",
            "Navigation patterns",
            "Page transitions",
        ],
    },
];

function formatPrice(value) {
    if (value === 0) return "0";
    if (Number.isInteger(value)) return String(value);

    return value.toFixed(2).replace(/\.00$/, "");
}

function getPlanPrice(plan, billingCycle) {
    if (plan.monthlyPrice === 0) return 0;

    if (billingCycle === "yearly") {
        const yearlyPrice = plan.yearlyPrice ?? plan.monthlyPrice * 12;
        return Number((yearlyPrice / 12).toFixed(2));
    }

    return plan.monthlyPrice;
}

function getAnnualTotal(plan) {
    if (plan.monthlyPrice === 0) return 0;

    return plan.yearlyPrice ?? plan.monthlyPrice * 12;
}

function buildUrlWithPlanRequest(pathname, searchParams, planId) {
    const params = new URLSearchParams(searchParams.toString());

    params.set(PLAN_REQUEST_PARAM, "open");
    params.set(PLAN_PARAM, planId);

    const query = params.toString();

    return query ? `${pathname}?${query}` : pathname;
}

function buildUrlWithPlanRequestSent(pathname, searchParams, planId) {
    const params = new URLSearchParams(searchParams.toString());

    params.set(PLAN_REQUEST_PARAM, "sent");
    params.set(PLAN_PARAM, planId);

    const query = params.toString();

    return query ? `${pathname}?${query}` : pathname;
}

function buildUrlWithoutPlanRequest(pathname, searchParams) {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(PLAN_REQUEST_PARAM);
    params.delete(PLAN_PARAM);

    const query = params.toString();

    return query ? `${pathname}?${query}` : pathname;
}

function validatePlanForm(values) {
    const errors = {};

    const name = values.name.trim();
    const email = values.email.trim();
    const number = values.number.trim();
    const message = values.message.trim();

    if (!name) {
        errors.name = "Please enter your name.";
    } else if (name.length < 2) {
        errors.name = "Name must be at least 2 characters.";
    }

    if (!email) {
        errors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please enter a valid email address.";
    }

    if (!number) {
        errors.number = "Please enter your phone number.";
    } else if (!/^[+()\-.\s0-9]{7,24}$/.test(number)) {
        errors.number = "Please enter a valid phone number.";
    }

    if (!message) {
        errors.message = "Please describe what you need.";
    } else if (message.length < 10) {
        errors.message = "Message must be at least 10 characters.";
    }

    return errors;
}

function FieldLabel({ htmlFor, children }) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-2 block text-[clamp(14px,0.9vw,18px)] font-medium text-white/90"
        >
            {children}
        </label>
    );
}

function PricingPlanModal({
    isOpen,
    isSent,
    onClose,
    onSubmitted,
    selectedPlan,
    billingCycle,
    displayedPrice,
    annualTotal,
}) {
    const lenis = useLenis();

    const [values, setValues] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [status, setStatus] = useState("idle");

    const isSubmitting = status === "submitting";
    const isSuccess = status === "success";

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        lenis?.stop?.();

        const restartStop = window.setInterval(() => {
            lenis?.stop?.();
        }, 80);

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.clearInterval(restartStop);
            document.body.style.overflow = originalOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
            window.removeEventListener("keydown", handleKeyDown);

            lenis?.start?.();

            requestAnimationFrame(() => {
                lenis?.start?.();
            });

            window.setTimeout(() => {
                lenis?.start?.();
            }, 80);
        };
    }, [isOpen, lenis, onClose]);

    useEffect(() => {
        if (isOpen) return;

        const timeoutId = window.setTimeout(() => {
            setValues(INITIAL_FORM);
            setErrors({});
            setServerError("");
            setStatus("idle");
        }, 500);

        return () => window.clearTimeout(timeoutId);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !isSent) return;

        setStatus("success");

        const timeoutId = window.setTimeout(() => {
            onClose();
        }, 1300);

        return () => window.clearTimeout(timeoutId);
    }, [isOpen, isSent, onClose]);

    const updateField = (field) => (eventOrValue) => {
        const nextValue =
            typeof eventOrValue === "string"
                ? eventOrValue
                : eventOrValue?.target?.value || "";

        setValues((current) => ({
            ...current,
            [field]: nextValue,
        }));

        setErrors((current) => ({
            ...current,
            [field]: "",
        }));

        setServerError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedPlan) return;

        const nextErrors = validatePlanForm(values);

        setErrors(nextErrors);
        setServerError("");

        if (Object.keys(nextErrors).length > 0) return;

        setStatus("submitting");

        try {
            const response = await fetch("/api/pricing-plan-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    phone: values.number.trim(),
                    message: values.message.trim(),
                    planId: selectedPlan.id,
                    planName: selectedPlan.name,
                    billingCycle,
                    displayedPrice,
                    annualTotal,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setStatus("idle");
                setServerError(
                    data?.error || "Something went wrong. Please try again."
                );
                return;
            }

            setStatus("success");
            onSubmitted(selectedPlan.id);
        } catch (error) {
            console.error("Pricing plan request error:", error);

            setStatus("idle");
            setServerError("Something went wrong. Please try again.");
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && selectedPlan && (
                <motion.div
                    key="pricing-plan-modal"
                    className="fixed inset-0 z-[9999] flex items-center justify-center px-6 py-10"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="pricing-plan-modal-title"
                >
                    <motion.button
                        type="button"
                        aria-label="Close pricing modal"
                        onClick={onClose}
                        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={MODAL_TRANSITION}
                    />

                    <motion.div
                        className="relative z-10 w-[80vw] overflow-hidden overflow-y-auto rounded-[1.5vw] border border-white/20 bg-black/[0.04] p-[3.5vw] text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl max-md:h-[75vh] max-md:w-[95%] max-md:rounded-[4vw] max-md:p-[6vw] max-sm:rounded-[5vw]"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={MODAL_TRANSITION}
                    >
                        <button
                            type="button"
                            aria-label="Close"
                            onClick={onClose}
                            className="group absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl leading-none text-white/70 transition-all duration-500 ease-in-out hover:border-[#ff5f00] hover:bg-[#ff5f00] hover:text-white"
                        >
                            <div className="relative flex h-4 w-4 items-center justify-center duration-500 ease-in-out group-hover:rotate-90">
                                <span className="h-[1px] w-4 rotate-45 bg-white" />
                                <span className="absolute h-[1px] w-4 -rotate-45 bg-white" />
                            </div>
                        </button>

                        <div className="relative z-10">
                            <h3
                                id="pricing-plan-modal-title"
                                className="text-[3vw] leading-none max-md:text-[8vw]"
                            >
                                {isSuccess
                                    ? "Plan request sent."
                                    : selectedPlan.name === "Custom"
                                        ? "Tell us what you want built."
                                        : `Start with ${selectedPlan.name}.`}
                            </h3>

                            <p className="mt-[1vw] max-w-[70vw] text24 leading-relaxed text-white/80 max-md:mt-4 max-md:max-w-full max-md:text-sm">
                                {isSuccess
                                    ? "We received your request. Closing this window now."
                                    : selectedPlan.name === "Custom"
                                        ? "Tell us the interaction, section, loader, transition, cursor, or WebGL detail you want. We will review it and get back to you."
                                        : `You selected the ${selectedPlan.name} plan at $${formatPrice(
                                            displayedPrice
                                        )}/monthly ${billingCycle === "yearly"
                                            ? `billed yearly at $${formatPrice(annualTotal)}`
                                            : "billed monthly"
                                        }.`}
                            </p>

                            {isSuccess ? (
                                <div className="mt-[4vw] rounded-[1vw] border border-emerald-400/20 bg-emerald-400/10 p-[2vw] max-md:mt-8 max-md:rounded-3xl max-md:p-6">
                                    <p className="text-[1.4vw] font-medium text-emerald-100 max-md:text-xl">
                                        Your plan request has been sent.
                                    </p>

                                    <p className="mt-2 text-[1vw] text-white/70 max-md:text-sm">
                                        We will get back to you shortly. No awkward refresh needed.
                                    </p>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-[3vw] grid grid-cols-2 gap-x-[3vw] gap-y-[2vw] max-md:mt-8 max-md:grid-cols-1 max-md:gap-5"
                                >
                                    <div className="space-y-[1vw] max-md:space-y-5">
                                        <div>
                                            <FieldLabel htmlFor="pricing-plan-name">Name*</FieldLabel>
                                            <Input
                                                id="pricing-plan-name"
                                                name="name"
                                                label={false}
                                                className="border-white/20 bg-white/10 text-white placeholder:text-white/35 focus:border-[#ff5f00]!"
                                                value={values.name}
                                                onChange={updateField("name")}
                                                autoComplete="name"
                                                error={errors.name}
                                                placeholder="Your name"
                                            />
                                        </div>

                                        <div>
                                            <FieldLabel htmlFor="pricing-plan-email">
                                                Email*
                                            </FieldLabel>
                                            <Input
                                                id="pricing-plan-email"
                                                name="email"
                                                type="email"
                                                label={false}
                                                className="border-white/20 bg-white/10 text-white placeholder:text-white/35 focus:border-[#ff5f00]!"
                                                value={values.email}
                                                onChange={updateField("email")}
                                                autoComplete="email"
                                                error={errors.email}
                                                placeholder="you@company.com"
                                            />
                                        </div>

                                        <div>
                                            <FieldLabel htmlFor="pricing-plan-number">
                                                Phone Number*
                                            </FieldLabel>
                                            <PhoneInput
                                                id="pricing-plan-number"
                                                name="number"
                                                label={false}
                                                placeholder="98765 43210"
                                                value={values.number}
                                                onChange={updateField("number")}
                                                defaultCountry="IN"
                                                countries={PRICING_PLAN_COUNTRIES}
                                                showCountryName
                                                error={errors.number}
                                                className="border-white/20 bg-white/10 text-white focus-within:border-[#ff5f00]!"
                                                countryButtonClassName="text-white/80 hover:text-white"
                                                flagClassName="text-base"
                                                dialCodeClassName="text-white"
                                                chevronClassName="text-white/60"
                                                dividerClassName="bg-white/15"
                                                inputClassName="text-white placeholder:text-white/35"
                                                dropdownClassName="min-w-64 border-white/10! bg-[#111111]! rounded-md text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                                                optionClassName="text-white/70 hover:bg-white/10 hover:text-white"
                                                activeOptionClassName="text-[#ff5f00]"
                                                optionDialClassName="text-white/40"
                                                errorClassName="text-red-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="h-full">
                                        <FieldLabel htmlFor="pricing-plan-message">
                                            Message*
                                        </FieldLabel>
                                        <Textarea
                                            id="pricing-plan-message"
                                            name="message"
                                            label={false}
                                            className="h-[17.3vw]! rounded-xl! border-white/20 bg-white/10 text-white placeholder:text-white/35 focus:border-[#ff5f00]! max-md:h-36!"
                                            rows={3}
                                            value={values.message}
                                            onChange={updateField("message")}
                                            error={errors.message}
                                            placeholder="Tell us what you want to build..."
                                        />
                                    </div>

                                    {serverError && (
                                        <div className="col-span-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm leading-6 text-red-200 max-md:col-span-1">
                                            {serverError}
                                        </div>
                                    )}

                                    {serverError && (
                                        <div className="col-span-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm leading-6 text-red-200 max-md:col-span-1">
                                            {serverError}
                                        </div>
                                    )}

                                    <div className="col-span-2 mt-4 flex items-center gap-4 max-md:col-span-1 max-md:flex-col max-md:items-start">
                                        <WebsiteButton
                                            text={isSubmitting ? "Sending..." : "Send Request"}
                                            href="#"
                                            preventDefault
                                            disabled={isSubmitting}
                                            onClick={handleSubmit}
                                            variant="orange"
                                            scaleClass="group-hover:scale-[50]"
                                            className="min-w-0"
                                        />
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function PricingToggle({ billingCycle, setBillingCycle }) {
    const isYearly = billingCycle === "yearly";

    return (
        <div className="mt-[7vw] flex items-center justify-center gap-[1.2vw] max-md:mt-16 max-md:gap-4">
            <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`text24 font-medium transition-colors max-md:text-sm ${!isYearly ? "text-black" : "text-black/50"
                    }`}
            >
                Monthly
            </button>

            <button
                type="button"
                onClick={() => setBillingCycle(isYearly ? "monthly" : "yearly")}
                className="relative h-[1.8vw] w-[3.3vw] rounded-full bg-[#ff5f00] p-[0.2vw] max-md:h-7 max-md:w-12 max-md:p-1"
                aria-label="Toggle billing cycle"
            >
                <span
                    className={`block size-[1.4vw] rounded-full bg-white shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] max-md:size-5 ${isYearly
                            ? "translate-x-[1.5vw] max-md:translate-x-5"
                            : "translate-x-0"
                        }`}
                />
            </button>

            <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`text24 font-medium transition-colors max-md:text-sm ${isYearly ? "text-black" : "text-black/50"
                    }`}
            >
                Yearly
            </button>

            <span className="rounded-full bg-[#ff5f00] px-[0.9vw] py-[0.45vw] text-[0.75vw] font-medium text-white max-md:px-3 max-md:py-1.5 max-md:text-xs">
                $179/YR
            </span>
        </div>
    );
}

function PricingCard({ plan, billingCycle, onSelect }) {
    const displayedPrice = getPlanPrice(plan, billingCycle);
    const annualTotal = getAnnualTotal(plan);
    const isYearly = billingCycle === "yearly";

    return (
        <article
            className={`flex min-h-[28vw] flex-col rounded-[1vw] p-[1vw] max-md:min-h-[420px] max-md:rounded-3xl max-md:p-4 ${plan.highlighted
                    ? "bg-[#0e0e0e] text-white"
                    : "bg-[#f4f4f4] text-[#0e0e0e]"
                }`}
        >
            <div className="p-[1vw] max-md:p-3">
                <h3 className="text34 max-md:text-2xl">{plan.name}</h3>

                <p
                    className={`text24 mt-[0.45vw] font-medium max-md:mt-2 max-md:text-sm ${plan.highlighted ? "text-white/55" : "text-black/45"
                        }`}
                >
                    {plan.subtext}
                </p>

                <div className="mt-[2vw] flex items-end justify-between gap-[0.45vw] max-md:mt-8">
                    <div className="flex items-end gap-[0.45vw]">
                        <span className="text24 max-md:pb-1 max-md:text-sm">$</span>

                        <span
                            className={`text-[3vw] font-medium leading-none max-md:text-5xl ${plan.highlighted ? "text-white" : "text-[#0e0e0e]"
                                }`}
                        >
                            {formatPrice(displayedPrice)}
                        </span>

                        <span
                            className={`text24 max-md:pb-1 max-md:text-sm ${plan.highlighted ? "text-white/55" : "text-black/45"
                                }`}
                        >
                            /monthly
                        </span>
                    </div>

                    {isYearly && plan.monthlyPrice > 0 && (
                        <p
                            className={`mt-2 text-[1vw] max-md:text-xs ${plan.highlighted ? "text-white/55" : "text-black/45"
                                }`}
                        >
                            billed yearly ${formatPrice(annualTotal)}
                        </p>
                    )}
                </div>
            </div>

            {plan.current ? (
                <button
                    type="button"
                    disabled
                    className="mt-auto flex h-[3.2vw] w-full cursor-default! items-center justify-center gap-3 rounded-full bg-[#e9ebeb] text24 font-medium text-black max-md:h-12 max-md:text-sm"
                >
                    {plan.cta}
                </button>
            ) : (
                <div className="mt-auto w-full">
                    <WebsiteButton
                        text={plan.cta}
                        href="#"
                        preventDefault
                        onClick={() => onSelect(plan)}
                        variant={plan.highlighted ? "orange" : "white"}
                        className="h-[3.2vw] w-full justify-center text24 max-md:h-12 max-md:text-sm"
                        scaleClass="group-hover:scale-[120]"
                        hoverTextClassName={
                            plan.highlighted
                                ? "group-hover:text-black"
                                : "group-hover:text-white"
                        }
                        innerClassName="group-hover:-translate-x-[1vw]"
                    />
                </div>
            )}

            <div
                className={`mt-[1vw] rounded-[0.35vw] p-[2vw] max-md:mt-4 max-md:rounded-2xl max-md:p-5 ${plan.highlighted ? "bg-white text-black" : "bg-[#e9ebeb]"
                    }`}
            >
                <ul className="space-y-[1.3vw] max-md:space-y-4">
                    {plan.features.map((feature) => (
                        <li
                            key={feature}
                            className="text24 flex items-center gap-[0.75vw] max-md:gap-3 max-md:text-sm"
                        >
                            <span
                                className={`flex size-[1.2vw] items-center justify-center rounded-full p-[0.3vw] text-[0.55vw] text-black max-md:size-4 max-md:text-[10px] ${plan.highlighted ? "bg-[#e9ebeb]" : "bg-white"
                                    }`}
                            >
                                <Check />
                            </span>

                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}

function PricingInner({ enableColorSwitch = true }) {
    const [billingCycle, setBillingCycle] = useState("monthly");

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const requestState = searchParams.get(PLAN_REQUEST_PARAM);
    const planIdFromRoute = searchParams.get(PLAN_PARAM);

    const selectedPlan = useMemo(() => {
        return PLANS.find((plan) => plan.id === planIdFromRoute) || null;
    }, [planIdFromRoute]);

    const isModalOpen =
        Boolean(selectedPlan) &&
        (requestState === "open" || requestState === "sent");

    const isModalSent = Boolean(selectedPlan) && requestState === "sent";

    useEffect(() => {
        if (!enableColorSwitch) return;

        const ctx = gsap.context(() => {
            gsap.set("#pricing", {
                backgroundColor: "#0e0e0e",
                color: "#ffffff",
            });

            gsap.set("#Workflow", {
                backgroundColor: "#0e0e0e",
                color: "#ffffff",
            });

            gsap.set("#AgencyProof", {
                backgroundColor: "#fff",
                color: "#0e0e0e",
            });

            gsap.timeline({
                scrollTrigger: {
                    trigger: "#pricing",
                    start: "10% 70%",
                    end: "120% 70%",
                    markers: false,
                    onEnter: () => {
                        gsap.to("#pricing", {
                            backgroundColor: "#fff",
                            color: "#0e0e0e",
                            duration: 0.4,
                            ease: "linear",
                        });

                        gsap.to("#LeftBlur", {
                            background:
                                "linear-gradient(to right, #fff, rgba(255,255,255,0.7), transparent)",
                            duration: 0.4,
                            ease: "linear",
                        });

                        gsap.to("#RightBlur", {
                            background:
                                "linear-gradient(to left, #fff, rgba(255,255,255,0.7), transparent)",
                            duration: 0.4,
                            ease: "linear",
                        });

                        gsap.to(
                            "#Workflow",
                            {
                                backgroundColor: "#fff",
                                color: "#0e0e0e",
                                duration: 0.4,
                                ease: "linear",
                            },
                            "<"
                        );

                        gsap.to(
                            "#marquee-svg",
                            {
                                filter: "invert(1)",
                                duration: 0.4,
                                ease: "linear",
                            },
                            "<"
                        );
                    },
                    onLeaveBack: () => {
                        gsap.to("#pricing", {
                            backgroundColor: "#0e0e0e",
                            color: "#ffffff",
                            duration: 0.4,
                            ease: "linear",
                        });

                        gsap.to(
                            "#marquee-svg",
                            {
                                filter: "invert(0)",
                                duration: 0.4,
                                ease: "linear",
                            },
                            "<"
                        );

                        gsap.to(
                            "#Workflow",
                            {
                                backgroundColor: "#0e0e0e",
                                color: "#ffffff",
                                duration: 0.4,
                                ease: "linear",
                            },
                            "<"
                        );

                        gsap.to("#LeftBlur", {
                            background:
                                "linear-gradient(to right, #0e0e0e, rgba(14,14,14,0.7), transparent)",
                            duration: 0.4,
                            ease: "linear",
                        });

                        gsap.to("#RightBlur", {
                            background:
                                "linear-gradient(to left, #0e0e0e, rgba(14,14,14,0.7), transparent)",
                            duration: 0.4,
                            ease: "linear",
                        });
                    },
                    onLeave: () => {
                        gsap.to("#pricing", {
                            backgroundColor: "#0e0e0e",
                            color: "#ffffff",
                            duration: 0.4,
                            ease: "linear",
                        });

                        gsap.fromTo(
                            "#AgencyProof",
                            {
                                backgroundColor: "#fff",
                                color: "#0e0e0e",
                            },
                            {
                                backgroundColor: "#0e0e0e",
                                color: "#ffffff",
                                duration: 0.4,
                                ease: "linear",
                            }
                        );
                    },
                    onEnterBack: () => {
                        gsap.to("#pricing", {
                            backgroundColor: "#fff",
                            color: "#0e0e0e",
                            duration: 0.4,
                            ease: "linear",
                        });

                        gsap.to("#AgencyProof", {
                            backgroundColor: "#fff",
                            color: "#0e0e0e",
                            duration: 0.4,
                            ease: "linear",
                        });
                    },
                },
            });
        });

        return () => ctx.revert();
    }, [enableColorSwitch]);

    const selectedPlanPrice = useMemo(() => {
        if (!selectedPlan) return 0;
        return getPlanPrice(selectedPlan, billingCycle);
    }, [billingCycle, selectedPlan]);

    const selectedPlanAnnualTotal = useMemo(() => {
        if (!selectedPlan) return 0;
        return getAnnualTotal(selectedPlan);
    }, [selectedPlan]);

    const closePlanModal = useCallback(() => {
        router.push(buildUrlWithoutPlanRequest(pathname, searchParams), {
            scroll: false,
        });
    }, [pathname, router, searchParams]);

    const handleSelectPlan = useCallback(
        (plan) => {
            if (plan.current) return;

            router.push(buildUrlWithPlanRequest(pathname, searchParams, plan.id), {
                scroll: false,
            });
        },
        [pathname, router, searchParams]
    );

    const handlePlanSubmitted = useCallback(
        (planId) => {
            router.push(buildUrlWithPlanRequestSent(pathname, searchParams, planId), {
                scroll: false,
            });
        },
        [pathname, router, searchParams]
    );

    return (
        <>
            <section
                id="pricing"
                className="relative z-10 flex h-fit w-full flex-col items-center justify-center gap-[2vw] overflow-x-hidden bg-white px-[5vw] py-[10vw] pt-[15vw] text-background max-md:gap-[8vw] max-md:px-[8vw] max-md:pb-[30vw] max-sm:pt-[40vw]"
            >
                <SplitLine as="p" className="text22 text-light-grey">
                    Free Vault
                </SplitLine>

                <RandomBlur
                    as="h2"
                    className="text140 w-full text-center max-md:w-[90vw]"
                >
                    30+ free effects, yours forever. Use them in client work without
                    attribution.
                </RandomBlur>

                <SplitLine
                    delay={0.3}
                    as="p"
                    className="text34 mt-[4vw] w-[65vw] text-center max-md:mt-[6vw] max-md:w-[90vw]"
                >
                    Get early access to premium effect packs, complete website sections,
                    founder pricing, and experimental releases before anyone else.
                </SplitLine>

                <PricingToggle
                    billingCycle={billingCycle}
                    setBillingCycle={setBillingCycle}
                />

                <div className="grid w-full grid-cols-3 gap-[2vw] max-md:grid-cols-1 max-md:gap-6">
                    {PLANS.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            billingCycle={billingCycle}
                            onSelect={handleSelectPlan}
                        />
                    ))}
                </div>
            </section>

            <PricingPlanModal
                isOpen={isModalOpen}
                isSent={isModalSent}
                selectedPlan={selectedPlan}
                billingCycle={billingCycle}
                displayedPrice={selectedPlanPrice}
                annualTotal={selectedPlanAnnualTotal}
                onClose={closePlanModal}
                onSubmitted={handlePlanSubmitted}
            />
        </>
    );
}

export default function Pricing({ enableColorSwitch = true }) {
    return (
        <Suspense fallback={null}>
            <PricingInner enableColorSwitch={enableColorSwitch} />
        </Suspense>
    );
}