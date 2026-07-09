import { z } from "zod";
import BLOCKED_DOMAINS from "./blocked-email-domains.json";

let BLOCKED_SET;
try {
  BLOCKED_SET = new Set(
    BLOCKED_DOMAINS.map((entry) => Object.values(entry)[0])
  );
} catch {
  BLOCKED_SET = new Set();
}

function getNumberPart(val) {
  const spaceIndex = val.indexOf(" ");
  return spaceIndex >= 0
    ? val.slice(spaceIndex + 1).replace(/\s/g, "")
    : val.replace(/\D/g, "");
}

export const formSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter your name.")
    .min(2, "Name must be at least 2 characters."),

  email: z
    .string()
    .min(1, "Please enter your email.")
    .email("Please enter a valid email address (e.g. you@company.com).")
    .refine(
      (val) => !BLOCKED_SET.has(val.split("@")[1]?.toLowerCase()),
      "Please use a work or personal email address."
    ),

  number: z
    .string()
    .min(1, "Please enter your phone number.")
    .refine(
      (val) => /^\d+$/.test(getNumberPart(val)),
      "Please enter a valid phone number."
    )
    .refine(
      (val) => getNumberPart(val).length >= 7,
      "Please enter a valid phone number."
    )
    .refine(
      (val) => getNumberPart(val).length <= 10,
      "Phone number must not exceed 10 digits."
    ),

  message: z.string().min(1, "Please enter a message.").min(10, "Message must be at least 10 characters."),
});

export function validateForm(values) {
  const result = formSchema.safeParse({
    name: values.name.trim(),
    email: values.email.trim(),
    number: values.number.trim(),
    message: values.message.trim(),
  });

  if (result.success) return {};

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
