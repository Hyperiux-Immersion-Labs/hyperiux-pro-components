"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import Button from "@/homepage/components/Button";
import { CopyButtonContent } from "@/components/ui/CodeBlock";
import { TextButton } from "@/components/Dashboard/DashboardUI";
import { PasswordEye } from "@/components/ui/PasswordEye";

// The Users tab's "Create user" (super admins): an email, a first name (last optional), a password
// (typed, or generated), and whether to email the sign-in details. Once created, the
// password shows here one last time to copy and share - it isn't kept anywhere.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
// No look-alikes (0/O, 1/l/I), so a password read out or retyped comes through right
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";

function generatePassword(length = 16) {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (value) => ALPHABET[value % ALPHABET.length]).join("");
}

const FIELD = "w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors duration-300 placeholder:text-white/35 focus:border-white/30";
const LABEL = "flex flex-col gap-2 text-sm text-white/80";
const SMALL_ACTION = "type-small inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-white/60 transition-colors duration-300 hover:text-primary [&_svg]:size-3.5";
// The icon buttons inside the password field (the Settings page's eye)
const FIELD_ICON = "grid size-7 cursor-pointer place-items-center text-white/45 transition-colors duration-300 hover:text-white aria-pressed:text-white";

function CopyLine({ label, value, copyLabel }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3 border border-white/10 bg-white/5 px-3 py-2.5">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs text-white/45">{label}</span>
        <code className="truncate font-code text-sm text-white">{value}</code>
      </span>
      <button
        type="button"
        aria-label={copied ? `${copyLabel} copied` : `Copy ${copyLabel}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            // Clipboard blocked: the value is on screen to select by hand
          }
        }}
        className={`${SMALL_ACTION} ${copied ? "text-primary" : ""}`}
      >
        <CopyButtonContent copied={copied} />
      </button>
    </div>
  );
}

export function CreateUserModal({ onClose, onCreated }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(true);
  // Generate's icon turns a full circle on every click
  const [spins, setSpins] = useState(0);
  const [sendDetails, setSendDetails] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // { email, password, emailed, emailError } once the account exists
  const [created, setCreated] = useState(null);
  const [copiedBoth, setCopiedBoth] = useState(false);

  async function handleSubmit(event) {
    event?.preventDefault();
    if (busy) return;
    setError("");
    const cleanEmail = email.trim();
    if (!EMAIL_RE.test(cleanEmail)) return setError("Enter a valid email address.");
    if (!firstName.trim()) return setError("Enter their first name.");
    if (password.length < MIN_PASSWORD) return setError(`The password needs at least ${MIN_PASSWORD} characters.`);

    setBusy(true);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password, firstName, lastName, sendEmail: sendDetails }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't create the account.");
        return;
      }
      setCreated({ email: data.email, password, emailed: data.emailed, emailError: data.emailError });
      onCreated?.();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function startAnother() {
    setCreated(null);
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword(generatePassword());
    setError("");
  }

  async function copyBoth() {
    try {
      await navigator.clipboard.writeText(`Email: ${created.email}\nPassword: ${created.password}\nSign in: ${window.location.origin}/sign-in`);
      setCopiedBoth(true);
      setTimeout(() => setCopiedBoth(false), 1600);
    } catch {
      // Clipboard blocked: both are on screen
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 px-4 backdrop-blur-lg"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-h"
        data-lenis-prevent
        className="relative max-h-[80svh] w-full max-w-lg overflow-y-auto overscroll-contain border border-white/10 bg-background p-6 text-foreground"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="group absolute right-5 top-5 flex h-10 w-10 items-center justify-center border border-white/20 bg-white/10 text-white/70 transition-all duration-500 ease-in-out hover:border-primary hover:bg-primary hover:text-white"
        >
          <div className="relative flex h-4 w-4 items-center justify-center duration-500 ease-in-out group-hover:rotate-90">
            <span className="h-px w-4 rotate-45 bg-white" />
            <span className="absolute h-px w-4 -rotate-45 bg-white" />
          </div>
        </button>

        {created ? (
          <div className="flex flex-col gap-5">
            <h2 id="create-user-h" className="type-h3 pr-12 text-foreground">
              Account Created
            </h2>
            <p className="text-sm text-white/80">
              {created.emailed
                ? `The sign-in details are on their way to ${created.email}.`
                : created.emailError || "Nothing was emailed. Copy the details below and share them yourself."}
            </p>
            <div className="flex flex-col gap-2">
              <CopyLine label="Email" value={created.email} copyLabel="email" />
              <CopyLine label="Password" value={created.password} copyLabel="password" />
            </div>
            <p className="text-xs text-white/45">The password isn&apos;t saved anywhere - copy it now if you need it. They can change it in Dashboard → Settings.</p>
            <div className="flex flex-wrap items-center gap-[calc(var(--cvw)*1.2)] max-lg:gap-4">
              <Button href="#" preventDefault variant="orange" onClick={copyBoth} text={copiedBoth ? "Copied" : "Copy Sign-in Details"} />
              <TextButton onClick={startAnother}>Create Another</TextButton>
              <TextButton onClick={onClose}>Done</TextButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 pr-12">
              <h2 id="create-user-h" className="type-h3 text-foreground">
                Create User
              </h2>
              <p className="text-sm text-white/60">They sign in with this email and password. The email counts as verified.</p>
            </div>

            <label className={LABEL}>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="off" className={FIELD} />
            </label>

            <div className="flex gap-3 max-md:flex-col">
              <label className={`${LABEL} flex-1`}>
                First name
                <input value={firstName} required onChange={(e) => setFirstName(e.target.value)} autoComplete="off" className={FIELD} />
              </label>
              <label className={`${LABEL} flex-1`}>
                <span>
                  Last name <span className="text-white/35">(optional)</span>
                </span>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="off" className={FIELD} />
              </label>
            </div>

            <div className={LABEL}>
              <label htmlFor="create-user-password">Password</label>
              <span className="relative block">
                <input
                  id="create-user-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className={`${FIELD} pr-20 font-code`}
                />
                <span className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Generate a password"
                    title="Generate a password"
                    onClick={() => {
                      setPassword(generatePassword());
                      setSpins((n) => n + 1);
                    }}
                    className={FIELD_ICON}
                  >
                    <RefreshCw
                      aria-hidden="true"
                      className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                      style={{ transform: `rotate(${spins * 360}deg)` }}
                    />
                  </button>
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((shown) => !shown)}
                    className={FIELD_ICON}
                  >
                    {/* the sign-in page's eye: struck while hidden, open while shown, animated between */}
                    <PasswordEye revealed={showPassword} className="size-4.5" />
                  </button>
                </span>
              </span>
              <span className="text-xs text-white/45">At least {MIN_PASSWORD} characters. Clerk also refuses passwords found in known breaches.</span>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-white/80">
              <input type="checkbox" checked={sendDetails} onChange={(e) => setSendDetails(e.target.checked)} className="peer sr-only" />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary ${sendDetails ? "border-primary bg-primary" : "border-white/30"}`}
              >
                {sendDetails && (
                  <svg viewBox="0 0 12 12" fill="none" className="size-2.5 text-background">
                    <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span>
                Email the sign-in details to them
                <span className="block text-xs text-white/45">Off: create it quietly and copy the password to share yourself.</span>
              </span>
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex flex-wrap items-center gap-[calc(var(--cvw)*1.2)] max-lg:gap-4">
              <Button href="#" preventDefault variant="orange" disabled={busy} onClick={handleSubmit} text={busy ? "Creating…" : sendDetails ? "Create and Email" : "Create User"} />
              <TextButton onClick={onClose} disabled={busy}>
                Cancel
              </TextButton>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
