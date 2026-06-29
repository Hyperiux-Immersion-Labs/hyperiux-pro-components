"use client";

import { useState } from "react";

export default function SendOtpButton() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSendOtp() {
    try {
      setIsSending(true);
      setMessage("");

      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to send OTP.");
        return;
      }

      setMessage("OTP sent successfully. Please check your email.");
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-[#ff5f00]"
      />

      <button
        type="button"
        onClick={handleSendOtp}
        disabled={isSending || !email}
        className="w-full rounded-xl bg-[#ff5f00] px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSending ? "Sending OTP..." : "Generate OTP"}
      </button>

      {message ? <p className="text-sm text-white/70">{message}</p> : null}
    </div>
  );
}