"use client";

import { z } from "zod";
import ContactForm, { type FieldConfig } from "@/components/animated-form/ContactForm";

const nationalDigits = (value: string): string =>
  value.replace(/^\+\d+\s*/, "").replace(/\D/g, "");

const NATIONAL_LENGTH_BY_DIAL: Record<string, [number, number]> = {
  "+91": [10, 10],
  "+353": [7, 9],
  "+1": [10, 10],
  "+44": [9, 10],
  "+61": [9, 9],
  "+49": [7, 11],
  "+33": [9, 9],
  "+971": [8, 9],
  "+65": [8, 8],
};

const TRUNK_ZERO_DIALS = new Set(["+44", "+353", "+61", "+49", "+33", "+971"]);

const isValidPhone = (value: string): boolean => {
  const dial = value.match(/^(\+\d+)\s/)?.[1];
  let digits = nationalDigits(value);

  if (dial && TRUNK_ZERO_DIALS.has(dial) && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  const [min, max] = NATIONAL_LENGTH_BY_DIAL[dial as string] ?? [6, 14];
  return digits.length >= min && digits.length <= max;
};

const enquiryFields: FieldConfig[] = [
  { type: "text", name: "name", label: "Full Name*", required: true },
  { type: "email", name: "email", label: "Email Address*", required: true },
  { type: "phone", name: "phone", label: "Phone*", required: true, defaultCountry: "IN" },
  {
    type: "select",
    name: "interest",
    label: "Interested In*",
    required: true,
    options: [
      { value: "brochure", label: "Project Brochure" },
      { value: "floor-plan", label: "Floor Plan" },
      { value: "private-viewing", label: "Private Viewing" },
      { value: "investment", label: "Investment Details" },
    ],
  },
  { type: "textarea", name: "message", label: "Message", rows: 4 },
  {
    type: "checkbox",
    name: "terms",
    required: true,
    label: (
      <>
        I agree to be contacted about Lumera Heights.
      </>
    ),
  },
];

const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .min(2, "Name must be at least 2 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .pipe(z.email("Please enter a valid email address.")),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required.")
    .refine(isValidPhone, {
      message: "Please enter a valid phone number for the selected country.",
    }),
  interest: z.enum(["brochure", "floor-plan", "private-viewing", "investment"], {
    message: "Please select what you are interested in.",
  }),
  message: z.string().trim().max(1000, "Message is too long.").optional(),
  terms: z.literal(true, {
    message: "Please agree before submitting.",
  }),
});

async function submitEnquiry(data: Record<string, any>) {
  console.log("Lumera enquiry submitted:", data);
}

export default function EnquiryForm() {
  return (
    <div className="w-full">
      <div className="mb-[2vw] flex flex-col gap-[0.8vw] max-[1025px]:mb-[5vw]">
        <p className="font-body text-[0.85vw] uppercase tracking-[0.2em] text-[#ca8216] max-[1025px]:text-[2.5vw] max-md:text-[3vw]">
          Private Enquiry
        </p>
        <h2 className="font-heading text-[3vw] font-medium leading-none text-[#1c1b1a] max-[1025px]:text-[7vw] max-md:text-[9vw]">
          Speak With an Advisor
        </h2>
      </div>

      <ContactForm
        fields={enquiryFields}
        schema={enquirySchema}
        onSubmit={submitEnquiry}
        submitLabel="Submit Enquiry"
        loadingLabel="Sending..."
        successMessage="Thank you. Our advisor will contact you shortly."
        errorMessage="Something went wrong. Please try again."
        accentColor="#ca8216"
        textColor="#1c1b1a"
        inputBackgroundColor="#ffffff"
        fieldBorderColor="#d8d2c8"
        inputRoundedness={28}
        duration={0.3}
      />
    </div>
  );
}
