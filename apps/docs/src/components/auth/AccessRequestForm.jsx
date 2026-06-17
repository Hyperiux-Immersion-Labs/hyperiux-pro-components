"use client";

import { useState } from "react";

const USER_TYPE_OPTIONS = [
  { label: "Student", value: "student" },
  { label: "Founder", value: "founder" },
  { label: "Designer", value: "designer" },
  { label: "Developer", value: "developer" },
  { label: "Agency / Studio", value: "agency" },
  { label: "Organisation", value: "organisation" },
  { label: "Other", value: "other" },
];

export default function AccessRequestForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    organisationName: "",
  });

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(
        data.message ||
          "Thank you for your interest. You are now on the Hyperiux Vault waiting list."
      );
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-[43vw] rounded-[0.9vw] border border-white/5 bg-white/[0.02] backdrop-blur-lg  px-[8vw] py-[3.2vw] text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] max-md:w-[95%] max-md:rounded-[2vw] max-sm:rounded-[3.5vw] max-md:py-[7vw]">
     

      {isSuccess ? (
        <div>
          <div className="text-center space-y-6 max-sm:py-20 py-6 ">
            <p className="text-[3vw] max-md:text-[7vw] max-sm:text-[9vw] font-medium text-white">
              You’re on the list.
            </p>

            <p className="mx-auto mt-3 max-w-md text-[1.2vw] max-md:text-[2.5vw] max-sm:text-[4vw] text-white/55">
              {message}
            </p>
          </div>

         
        </div>
      ) : (
        <>
        
         <div className="mb-10 text-center max-sm:mb-8">
        <h1 className="font-display text-[2.5vw] max-md:text-[7vw] max-sm:text-[9vw] font-normal leading-none text-white">
          Unlock the Vault
        </h1>

        <p className="mx-auto mt-2 w-full text-center text-[1vw] max-md:text-[2.5vw] max-sm:text-[4vw] text-white/50 max-sm:mt-4 ">
          Create your free account and start exploring the Vault.
          <br className="max-sm:hidden" />
          Your login details will be delivered to your inbox.
        </p>
      </div>
        <form onSubmit={handleSubmit} className="space-y-5 max-sm:space-y-5">
          <div>
            <label className="mb-2 block text-[clamp(14px,0.9vw,18px)] font-medium text-white/90">
              Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
              placeholder="your name"
              className="h-[3vw] w-full rounded-full border border-transparent bg-white/10 px-7 text-[clamp(15px,0.95vw,19px)] text-white outline-none transition-colors placeholder:text-white/35 focus:border-primary/70 max-md:h-12 max-sm:px-5"
            />
          </div>

          <div>
            <label className="mb-2 block text-[clamp(14px,0.9vw,18px)] font-medium text-white/90">
              Email
            </label>

            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
              placeholder="youremail@gmail.com"
              className="h-[3vw] w-full rounded-full border border-transparent bg-white/10 px-7 text-[clamp(15px,0.95vw,19px)] text-white outline-none transition-colors placeholder:text-white/35 focus:border-primary/70 max-md:h-12 max-sm:px-5"
            />
          </div>

          <div>
            <label className="mb-2 block text-[clamp(14px,0.9vw,18px)] font-medium text-white/90">
              I am
            </label>

            <select
              value={formData.userType}
              onChange={(event) => updateField("userType", event.target.value)}
              required
              className="h-[3vw] w-full appearance-none rounded-full border border-transparent bg-white/10 px-7 text-[clamp(15px,0.95vw,19px)] text-white/80 outline-none transition-colors focus:border-primary/70 max-md:h-12 max-sm:px-5"
            >
              <option value="" disabled>
                Choose an option
              </option>

              {USER_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {formData.userType === "organisation" ||
          formData.userType === "agency" ? (
            <div>
              <label className="mb-2 block text-[clamp(14px,0.9vw,18px)] font-medium text-white/90">
                Organisation name
              </label>

              <input
                type="text"
                value={formData.organisationName}
                onChange={(event) =>
                  updateField("organisationName", event.target.value)
                }
                required
                placeholder="Company / studio / team name"
                className="h-[3vw] w-full rounded-full border border-transparent bg-white/10 px-7 text-[clamp(15px,0.95vw,19px)] text-white outline-none transition-colors placeholder:text-white/35 focus:border-primary/70 max-md:h-12 max-sm:px-5"
              />
            </div>
          ) : null}

          {message && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm leading-6 text-red-200">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-12 flex h-[3.3vw] min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-[clamp(16px,1.05vw,22px)] font-medium text-white transition-colors duration-300 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-55 max-sm:mt-8 max-md:h-12 cursor-pointer"
          >
            {isSubmitting ? "Submitting..." : "Continue"}
          </button>
        </form>
        </>
        
      )}
      

      
    </div>
  );
}