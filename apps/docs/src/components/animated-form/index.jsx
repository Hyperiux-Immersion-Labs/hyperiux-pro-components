'use client'

import { z } from "zod";
import ContactForm from "./ContactForm";

const FIELDS = [
 { type:"text", name:"name", label:"Name*", required: true },
 { type:"email", name:"email", label:"Business Email*", required: true },
 { type:"phone", name:"phone", label:"Phone*", required: true, defaultCountry:"IN" },
 {
 type:"select",
 name:"topic",
 label:"Topic*",
 required: true,
 options: [
 { value:"general", label:"General Inquiry" },
 { value:"partnership", label:"Partnership" },
 ],
 },
 { type:"textarea", name:"message", label:"Your message", rows: 4 },
 {
 type:"checkbox",
 name:"terms",
 required: true,
 label: <>I agree to the <a href="#" className="underline">Terms</a>.</>,
 },
];

// Phone values are stored as "+<dial> <number>" (e.g. "+91 9876543210").
// Strip the leading dial code so we count only the national number's digits.
const nationalDigits = (val) => val.replace(/^\+\d+\s*/, "").replace(/\D/g, "");

const contactSchema = z.object({
 name: z
 .string()
 .trim()
 .min(1, "Name is required.")
 .min(2, "Name must be at least 2 characters."),
 email: z
 .string()
 .trim()
 .min(1, "Business Email is required.")
 .pipe(z.email("Please enter a valid email address.")),
 phone: z
 .string()
 .trim()
 .min(1, "Phone is required.")
 .refine((val) => nationalDigits(val).length === 10, {
 message: "Phone number must be 10 digits.",
 }),
 topic: z.enum(["general", "partnership"], {
 message: "Please select a topic.",
 }),
 message: z.string().trim().max(1000, "Message is too long.").optional(),
 terms: z.literal(true, {
 message: "You must agree to the Terms.",
 }),
});

async function submitHandler(data) {
 console.log("Contact form submitted:", data);
}

export default function AnimatedForm() {
 return (
 <main className="w-full bg-white min-h-screen mx-auto py-20 max-md:pt-28 px-6">
  <div className="w-[50%] max-md:w-[90%] max-sm:w-[95%] mx-auto">  <h1 className="text-3xl text-black mb-8">Get in touch</h1>
 <ContactForm
 fields={FIELDS}
 schema={contactSchema}
 onSubmit={submitHandler}
 submitLabel="Send Message"
 />
 </div>
 </main>
 );
}
