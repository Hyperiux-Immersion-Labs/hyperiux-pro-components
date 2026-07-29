
"use client";

/**
 *
 * fields: FieldConfig[]
 * Array that drives EVERY form field. Each object can be:
 *

 * onSubmit: async (data: Record<string, any>) => void
 * Called with the collected form data when validation passes.
 * Should throw on failure so the form can show the error banner.
 *
 * submitLabel?: string (default"Submit")
 * loadingLabel?: string (default"Sending...")
 * successMessage?: string (default" Form submitted successfully!")
 * errorMessage?: string (default" Error sending message. Please try again.")
 *
 * schema?: ZodType
 * Optional Zod schema for the whole form. When provided it becomes the
 * source of truth for validation and its messages are mapped back onto
 * fields by name (schema key === field.name). The built-in checks below
 * are used only when no schema is supplied.
 *
 * Built-in validation (fallback when no `schema` is passed)
 * - required fields checked automatically
 * - email fields validated with regex
 * - phone fields validated for minimum length
 * - Each field can supply its own `validate(value) => string | undefined`

 */

import React, { useState, useCallback, useId } from "react";
import Input from "./Input";
import Textarea from "./Textarea";
import Select from "./Select";
import PhoneInput from "./PhoneInput";
import Checkbox from "./Checkbox";
import Button from "./Button";


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @typedef {Object} FieldConfig
 * @property {string} type
 * @property {string} name
 * @property {import('react').ReactNode} [label]
 * @property {boolean} [required]
 * @property {string} [defaultCountry]
 * @property {import('./Select').SelectOption[]} [options]
 * @property {number} [rows]
 * @property {(value: any) => string | undefined} [validate]
 */

/**
 * @param {FieldConfig} field
 * @param {any} value
 * @returns {string | undefined}
 */
function defaultValidate(field, value) {
 if (field.required && (value ==="" || value === false || value == null)) {
 return `${typeof field.label ==="string" ? field.label.replace("*","") :"This field"} is required.`;
 }
 if (field.type ==="email" && value && !EMAIL_RE.test(value)) {
 return"Invalid email address.";
 }
 if (field.type ==="phone" && value && value.replace(/\D/g,"").length < 7) {
 return"Invalid phone number.";
 }
 return undefined;
}

/**
 * @param {FieldConfig[]} fields
 * @returns {Record<string, any>}
 */
function buildInitialValues(fields) {
 /** @type {Record<string, any>} */
 const values = {};
 for (const f of fields) {
 if (f.type ==="checkbox") values[f.name] = false;
 else if (f.type ==="select") values[f.name] ="";
 else values[f.name] ="";
 }
 return values;
}

/**
 * @typedef {Object} ContactFormProps
 * @property {FieldConfig[]} [fields]
 * @property {(data: Record<string, any>) => Promise<void>} onSubmit
 * @property {import('zod').ZodType<any>} [schema]
 * @property {string} [submitLabel]
 * @property {string} [loadingLabel]
 * @property {string} [successMessage]
 * @property {string} [errorMessage]
 */

// component
/** @param {ContactFormProps} props */
export default function ContactForm({
 fields = [],
 onSubmit,
 schema,
 submitLabel ="Submit",
 loadingLabel ="Sending...",
 successMessage =" Form submitted successfully!",
 errorMessage =" Error sending message. Please try again.",
}) {
 const [values, setValues] = useState(() => buildInitialValues(fields));
 const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));
 const [isLoading, setIsLoading] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [failed, setFailed] = useState(false);
 const uid = useId().replace(/:/g, "");
 const sectionId = `contact-form-${uid}`;

 // ── value helpers ──
 const setValue = useCallback(
 /**
  * @param {string} name
  * @param {any} value
  */
 (name, value) => {
 setValues((prev) => ({ ...prev, [name]: value }));
 }, []);

 const clearError = useCallback(
 /** @param {string} name */
 (name) => {
 setErrors((prev) => {
 if (!prev[name]) return prev;
 const next = { ...prev };
 delete next[name];
 return next;
 });
 }, []);

 // ── per-field validation ──
 const validateField = useCallback(
 /**
  * @param {FieldConfig} field
  * @param {any} value
  */
 (field, value) => {
 // Run built-in checks first
 const builtIn = defaultValidate(field, value);
 if (builtIn) return builtIn;
 // Then custom validator
 if (field.validate) return field.validate(value);
 return undefined;
 },
 []
 );

 // ── full-form validation ──
 // Returns { valid, data } where `data` is Zod's parsed (coerced/trimmed)
 // output when a schema is used, or the raw values otherwise.
 const validateAll = useCallback(() => {
 /** @type {Record<string, string>} */
 const newErrors = {};

 if (schema) {
 // Zod is the source of truth: map the first issue per field by name.
 const result = schema.safeParse(values);
 if (result.success) {
 setErrors(newErrors);
 return { valid: true, data: result.data };
 }
 for (const issue of result.error.issues) {
 const key = /** @type {string | number | undefined} */ (issue.path[0]);
 if (key != null && !newErrors[key]) newErrors[key] = issue.message;
 }
 } else {
 for (const f of fields) {
 const err = validateField(f, values[f.name]);
 if (err) newErrors[f.name] = err;
 }
 }

 setErrors(newErrors);
 return { valid: Object.keys(newErrors).length === 0, data: values };
 }, [fields, values, validateField, schema]);

 // ── submit ──
 const handleSubmit = useCallback(
 /** @param {import('react').FormEvent<HTMLFormElement>} e */
 async (e) => {
 e.preventDefault();
 const { valid, data } = validateAll();
 if (!valid) return;

 setIsLoading(true);
 setFailed(false);

 try {
 await onSubmit(data);
 setSubmitted(true);
 setValues(buildInitialValues(fields));
 setTimeout(() => setSubmitted(false), 7000);
 } catch {
 setFailed(true);
 setTimeout(() => setFailed(false), 7000);
 } finally {
 setIsLoading(false);
 }
 },
 [fields, validateAll, onSubmit]
 );

 // ── render field ──
 /** @param {FieldConfig} field */
 const renderField = (field) => {
 const { name, type, label, options, rows, defaultCountry } = field;
 const value = values[name];
 const error = errors[name];

 /** @param {any} val */
 const commonChange = (val) => {
 setValue(name, val);
 clearError(name);
 };

 switch (type) {
 case"textarea":
 return (
 <Textarea
 key={name}
 id={name}
 label={label}
 rows={rows}
 value={value}
 onChange={(e) => commonChange(e.target.value)}
 error={error}
 />
 );

 case"select":
 return (
 <Select
 key={name}
 id={name}
 label={/** @type {string | undefined} */ (label)}
 options={options || []}
 value={value}
 onChange={(e) => commonChange(e.target.value)}
 error={error}
 />
 );

 case"phone":
 return (
 <PhoneInput
 key={name}
 id={name}
 label={/** @type {string | false | undefined} */ (label)}
 value={value}
 onChange={(val) => commonChange(val)}
 defaultCountry={defaultCountry ||"IN"}
 error={error}
 />
 );

 case"checkbox":
 return (
 <Checkbox
 key={name}
 id={name}
 label={label}
 checked={!!value}
 onChange={(checked) => commonChange(checked)}
 error={error}
 />
 );

 // text | email | url | number | password |
 default:
 return (
 <Input
 key={name}
 id={name}
 label={label}
 type={type ||"text"}
 value={value}
 onChange={(e) => commonChange(e.target.value)}
 error={error}
 />
 );
 }
 };

 return (
 <section className="h-full w-full" id={sectionId}>
 <div className="w-full h-full">
 <div className="w-full flex flex-col gap-[2vw]">
 <form
 autoComplete="off"
 className="space-y-[1.2vw] max-md:space-y-[4vw] max-[1025px]:space-y-[4vw]"
 onSubmit={handleSubmit}
 >
 {fields.map((field) => renderField(field))}

 <div className="flex items-center justify-start  max-md:mt-[10vw]">
 <Button
 type="submit"
 isLoading={isLoading}
 loadingText={loadingLabel}
 className="mt-[3vw]  max-md:mt-0 max-[1025px]:mt-[3vw]"
 >
 {submitLabel}
 </Button>
 </div>

 {submitted && (
 <p className="text-green-600 text-sm mt-2">{successMessage}</p>
 )}
 {failed && (
 <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
 )}
 </form>
 </div>
 </div>
 </section>
 );
}
