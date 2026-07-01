"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const fileInputRef = useRef(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Password change
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);

  // Forgot password OTP flow
  const [otpStep, setOtpStep] = useState("idle"); // idle | sent | verifying
  const [otpCode, setOtpCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPw, setResettingPw] = useState(false);

  async function handlePasswordChange(event) {
    event.preventDefault();
    if (!user) return;

    // capture before async — event.currentTarget becomes null after await
    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");

    if (!currentPassword || !newPassword) {
      setPwError("Both fields are required.");
      return;
    }

    setSavingPw(true);
    setPwMessage("");
    setPwError("");

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPwError(data.error || "Unable to update password.");
        return;
      }

      form.reset();
      setPwMessage("Password updated successfully.");
    } catch (err) {
      console.error("Password change error:", err);
      setPwError("Something went wrong. Please try again.");
    } finally {
      setSavingPw(false);
    }
  }

  async function handleForgotPassword() {
    setSendingOtp(true);
    setPwError("");
    setPwMessage("");

    try {
      const res = await fetch("/api/user/send-reset-otp", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setPwError(data.error || "Unable to send OTP. Please try again.");
        return;
      }

      setOtpStep("sent");
    } catch {
      setPwError("Something went wrong. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleOtpReset(event) {
    event.preventDefault();

    if (!otpCode || !resetNewPassword) {
      setPwError("Please enter the OTP and your new password.");
      return;
    }

    setResettingPw(true);
    setPwError("");

    try {
      const res = await fetch("/api/user/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpCode, newPassword: resetNewPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPwError(data.error || "Invalid OTP or something went wrong.");
        return;
      }

      setPwMessage("Password reset successfully.");
      setOtpStep("idle");
      setOtpCode("");
      setResetNewPassword("");
    } catch {
      setPwError("Something went wrong. Please try again.");
    } finally {
      setResettingPw(false);
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    if (!user) return;

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();

    setSavingProfile(true);
    setMessage("");
    setError("");

    try {
      await user.update({
        firstName,
        lastName,
      });
      await user.reload();
      setMessage("Profile updated.");
    } catch (err) {
      console.error(err);
      setError("Unable to update your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!user || !file) return;

    setSavingImage(true);
    setMessage("");
    setError("");

    try {
      await user.setProfileImage({ file });
      await user.reload();
      setMessage("Profile picture updated.");
    } catch (err) {
      console.error(err);
      setError("Unable to update your profile picture.");
    } finally {
      setSavingImage(false);
      event.target.value = "";
    }
  }

  if (!isLoaded) {
    return (
      <div className="text-white p-10">
        Loading settings...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border border-white/10 rounded-2xl p-8">
        Sign in to manage your settings.
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <div className="border border-white/10 rounded-lg p-8 bg-white/5 backdrop-blur-lg  h-fit ">
        <div className="relative w-32 h-32">
          <Image
            src={user.imageUrl}
            alt={user.fullName || "Profile picture"}
            fill
            sizes="128px"
            className="rounded-full object-cover border border-white/10"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={savingImage}
            className="absolute bottom-1 right-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition duration-300 hover:bg-[#ff5f00] hover:text-white disabled:opacity-60 cursor-pointer"
            aria-label="Update profile picture"
          >
            {savingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        <h2 className="text-2xl font-semibold mt-6">
          {user.fullName || "Your profile"}
        </h2>

        <p className="mt-2 break-all">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>

      <div className="border border-white/10 rounded-lg p-8 bg-white/5 backdrop-blur-lg ">
        <div className="mb-8">
          <h2 className="text-3xl">
            Settings
          </h2>

          <p className="mt-2">
            Update your account name and profile picture.
          </p>
        </div>

        <form
          key={user.id}
          onSubmit={handleProfileSubmit}
          className="space-y-6 max-w-2xl"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm">
                First name
              </span>

              <input
                name="firstName"
                defaultValue={user.firstName || ""}
                className="mt-2 w-full rounded-xl border border-white/10  px-4 py-3 text-white outline-none transition focus:border-white/40"
              />
            </label>

            <label className="block">
              <span className="text-sm">
                Last name
              </span>

              <input
                name="lastName"
                defaultValue={user.lastName || ""}
                className="mt-2 w-full rounded-xl border border-white/10  px-4 py-3 text-white outline-none transition focus:border-white/40"
              />
            </label>
          </div>

          <div>
            <p className="text-sm">
              Email
            </p>

            <p className="mt-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white/70">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          {(message || error) && (
            <p className={error ? "text-red-400" : "text-emerald-400"}>
              {error || message}
            </p>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-black transition hover:bg-[#ff5f00] hover:text-white duration-300 disabled:opacity-60 cursor-pointer"
          >
            {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </form>

        <div className="mt-10 border-t border-white/10 pt-10 max-w-2xl">
          <h3 className="text-xl font-medium mb-1">Change Password</h3>
          <p className="text-sm text-white/50 mb-6">Update your account password.</p>

          {otpStep === "idle" ? (
            <form onSubmit={handlePasswordChange} className="space-y-4 flex flex-col">
              <label className="block">
                <span className="text-sm">Current password</span>
                <div className="relative mt-2">
                  <input
                    name="currentPassword"
                    type={showCurrentPw ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 pr-12 text-white outline-none transition focus:border-white/40"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                    aria-label={showCurrentPw ? "Hide password" : "Show password"}
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="text-sm">New password</span>
                <div className="relative mt-2">
                  <input
                    name="newPassword"
                    type={showNewPw ? "text" : "password"}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 pr-12 text-white outline-none transition focus:border-white/40"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                    aria-label={showNewPw ? "Hide password" : "Show password"}
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingOtp}
                className="inline-flex items-center gap-2 text-sm text-[#ff5f00] hover:text-[#ff9253] transition duration-300 disabled:opacity-50"
              >
                {sendingOtp && <Loader2 className="h-3 w-3 animate-spin" />}
                Forgot password?
              </button>

              {(pwMessage || pwError) && (
                <p className={pwError ? "text-red-400 text-sm" : "text-emerald-400 text-sm"}>
                  {pwError || pwMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={savingPw}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-black transition hover:bg-[#ff5f00] hover:text-white duration-300 disabled:opacity-60 cursor-pointer"
              >
                {savingPw && <Loader2 className="h-4 w-4 animate-spin" />}
                Update password
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpReset} className="space-y-4">
              <p className="text-sm text-white/60">
                We sent a verification code to <span className="text-white">{user.primaryEmailAddress?.emailAddress}</span>. Enter it below along with your new password.
              </p>

              <label className="block">
                <span className="text-sm">Verification code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white outline-none transition focus:border-white/40"
                  placeholder="Enter OTP"
                />
              </label>

              <label className="block">
                <span className="text-sm">New password</span>
                <div className="relative mt-2">
                  <input
                    type={showResetPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 pr-12 text-white outline-none transition focus:border-white/40"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                    aria-label={showResetPw ? "Hide password" : "Show password"}
                  >
                    {showResetPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {(pwMessage || pwError) && (
                <p className={pwError ? "text-red-400 text-sm" : "text-emerald-400 text-sm"}>
                  {pwError || pwMessage}
                </p>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={resettingPw}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-black transition hover:bg-[#ff5f00] hover:text-white duration-300 disabled:opacity-60 cursor-pointer"
                >
                  {resettingPw && <Loader2 className="h-4 w-4 animate-spin" />}
                  Reset password
                </button>

                <button
                  type="button"
                  onClick={() => { setOtpStep("idle"); setOtpCode(""); setResetNewPassword(""); setPwError(""); }}
                  className="text-sm text-white/50 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
