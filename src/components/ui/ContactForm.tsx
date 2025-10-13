"use client";
import { useCallback, useState } from "react";
import { motion } from "motion/react";
import Button from "./Button";

type SubmitState = "idle" | "submitting" | "success" | "error";

const SERVICES = [
  "Product Design",
  "Development",
  "GTM Strategy",
  "Healthcare Apps",
  "AI Development",
  "IoT Development",
  "Voice Agents",
];

const BUDGETS = [
  "$10K - $25K",
  "$25K - $50K",
  "$50K - $100K",
  "$100K - $250K",
  "$250K - $500K",
  "$500K+",
];

const COUNTRY_CODES = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
];

const ContactForm = () => {
  const [status, setStatus] = useState<SubmitState>("idle");
  const [error, setError] = useState<string>("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    
    if (!match) return value;
    
    const parts = [match[1], match[2], match[3]].filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
    return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const name = `${firstName} ${lastName}`.trim();
    const email = String(formData.get("email") || "").trim();
    const fullPhone = phoneNumber ? `${countryCode} ${phoneNumber}` : "";
    const service = String(formData.get("service") || "").trim();
    const budget = String(formData.get("budget") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!firstName || !lastName || !email || !message) {
      setError("Please fill in first name, last name, email, and message.");
      setStatus("error");
      return;
    }

    try {
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name,
          firstName,
          lastName,
          email,
          phone: fullPhone, 
          service, 
          budget,
          message 
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send message.");
      }

      setStatus("success");
      form.reset();
      setPhoneNumber("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }, [countryCode, phoneNumber]);

  return (
    <form onSubmit={handleSubmit} className="w-full mt-10 flex flex-col gap-6">
      {/* First Name and Last Name */}
      <div className="flex w-full gap-6 flex-wrap sm:flex-nowrap">
        <div className="w-full flex flex-col">
          <label htmlFor="firstName" className="font-light text-lg mb-1">
            First Name <span className="text-secondary">*</span>
          </label>
          <input
            name="firstName"
            type="text"
            placeholder="John"
            id="firstName"
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary transition-all duration-300 bg-transparent py-3 px-1"
            required
          />
        </div>
        <div className="w-full flex flex-col">
          <label htmlFor="lastName" className="font-light text-lg mb-1">
            Last Name <span className="text-secondary">*</span>
          </label>
          <input
            name="lastName"
            type="text"
            placeholder="Doe"
            id="lastName"
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary transition-all duration-300 bg-transparent py-3 px-1"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex w-full gap-6">
        <div className="w-full flex flex-col">
          <label htmlFor="email" className="font-light text-lg mb-1">
            Email <span className="text-secondary">*</span>
          </label>
          <input
            name="email"
            type="email"
            placeholder="john@company.com"
            id="email"
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary transition-all duration-300 bg-transparent py-3 px-1"
            required
          />
        </div>
      </div>

      {/* Phone Number */}
      <div className="flex w-full gap-6 flex-wrap sm:flex-nowrap">
        <div className="w-full flex flex-col">
          <label htmlFor="phone" className="font-light text-lg mb-1">
            Phone Number
          </label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="outline-none border-b-2 border-foreground/20 focus:border-secondary focus:shadow-[0_4px_12px_rgba(168,171,243,0.4)] transition-all duration-300 bg-zinc-900/50 backdrop-blur-sm py-3 pl-3 pr-10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjYThhYmYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:10px_6px] bg-[right_0.5rem_center] bg-no-repeat rounded-lg"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code} className="bg-zinc-900 text-foreground py-2">
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="(555) 123-4567"
              id="phone"
              value={phoneNumber}
              onChange={handlePhoneChange}
              maxLength={14}
              className="flex-1 outline-none border-b-2 border-foreground/20 focus:border-secondary transition-all duration-300 bg-transparent py-3 px-1"
            />
          </div>
        </div>
      </div>

      {/* Service and Budget */}
      <div className="flex w-full gap-6 flex-wrap sm:flex-nowrap">
        <div className="w-full flex flex-col">
          <label htmlFor="service" className="font-light text-lg mb-1">
            Service Interested In
          </label>
          <select
            name="service"
            id="service"
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary focus:shadow-[0_4px_12px_rgba(168,171,243,0.4)] transition-all duration-300 bg-zinc-900/50 backdrop-blur-sm py-3 px-1 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjYThhYmYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px_8px] bg-[right_0.5rem_center] bg-no-repeat pr-8 rounded-lg"
          >
            <option value="" className="bg-zinc-900 text-foreground py-3">
              Select Service...
            </option>
            {SERVICES.map((service) => (
              <option key={service} value={service} className="bg-zinc-900 text-foreground py-3 hover:bg-secondary/20">
                {service}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full flex flex-col">
          <label htmlFor="budget" className="font-light text-lg mb-1">
            Project Budget
          </label>
          <select
            name="budget"
            id="budget"
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary focus:shadow-[0_4px_12px_rgba(168,171,243,0.4)] transition-all duration-300 bg-zinc-900/50 backdrop-blur-sm py-3 px-1 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjYThhYmYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px_8px] bg-[right_0.5rem_center] bg-no-repeat pr-8 rounded-lg"
          >
            <option value="" className="bg-zinc-900 text-foreground py-3">
              Select Budget...
            </option>
            {BUDGETS.map((budget) => (
              <option key={budget} value={budget} className="bg-zinc-900 text-foreground py-3 hover:bg-secondary/20">
                {budget}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="font-light text-lg mb-1 block">
          Message <span className="text-secondary">*</span>
        </label>
        <textarea
          name="message"
          id="message"
          rows={5}
          placeholder="Tell us more about your project..."
          className="w-full outline-none border-b-2 border-foreground/20 focus:border-secondary transition-all duration-300 bg-transparent py-3 px-1 resize-none"
          required
        ></textarea>
      </div>

      {/* Status Messages */}
      {status === "error" && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3"
        >
          {error}
        </motion.p>
      )}
      {status === "success" && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-500 text-sm bg-green-500/10 border border-green-500/30 rounded-lg p-3"
        >
          Message sent! We&apos;ll be in touch soon.
        </motion.p>
      )}

      {/* Submit Button */}
      <div className="flex">
        <Button type="submit" disabled={status === "submitting"}>
          <span className="px-5">{status === "submitting" ? "Sending..." : "Send Message"}</span>
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;


