"use client";

import { useState } from "react";

export default function CliTokenManager({ plan }) {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isPro = plan === "pro";

  async function generateToken() {
    if (!isPro || isLoading) return;

    setIsLoading(true);
    setMessage("");
    setToken("");

    try {
      const response = await fetch("/api/cli/token", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate CLI token.");
      }

      setToken(data.token);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function revokeToken() {
    if (!isPro || isLoading) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/cli/token/revoke", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to revoke CLI token.");
      }

      setToken("");
      setMessage(data.message || "CLI token revoked.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
      <div className="flex items-start justify-between gap-6 max-md:flex-col">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            CLI Token
          </h2>

          <p className="mt-2 max-w-2xl text-white/60">
            Generate a private token to install Pro effects through the
            Hyperiux CLI. Keep it secret. Anyone with this token can access Pro
            downloads from your account.
          </p>

          {!isPro && (
            <p className="mt-4 text-sm text-[#ff5f00]">
              CLI tokens are available only for Pro users.
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={generateToken}
            disabled={!isPro || isLoading}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#ff5f00] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? "Working..." : "Generate Token"}
          </button>

          <button
            type="button"
            onClick={revokeToken}
            disabled={!isPro || isLoading}
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Revoke
          </button>
        </div>
      </div>

      {token && (
        <div className="mt-6 rounded-xl border border-[#ff5f00]/30 bg-black/50 p-4">
          <p className="mb-2 text-sm text-white/50">
            Copy this token now. It will not be shown again.
          </p>

          <code className="block overflow-x-auto whitespace-nowrap rounded-lg bg-black px-4 py-3 text-sm text-[#ff5f00]">
            {token}
          </code>
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm text-white/60">
          {message}
        </p>
      )}

      <div className="mt-6 rounded-xl bg-black/40 p-4">
        <p className="mb-2 text-sm text-white/50">
          Use it like this:
        </p>

        <code className="block overflow-x-auto whitespace-nowrap text-sm text-white/75">
          HYPERIUX_TOKEN=hpx_your_token npx hyperiux add helix-slider
        </code>
      </div>
    </div>
  );
}