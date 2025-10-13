"use client";
import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { HiPaperAirplane } from "react-icons/hi2";

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
  "Under $10K",
  "$10K - $25K",
  "$25K - $50K",
  "$50K - $100K",
  "$100K - $250K",
  "$250K+",
];

const COUNTRY_CODES = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+61", country: "AU" },
  { code: "+971", country: "AE" },
  { code: "+49", country: "DE" },
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

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const companyEmail = String(formData.get("companyEmail") || "").trim();
    const fullPhone = phoneNumber ? `${countryCode} ${phoneNumber}` : "";
    const service = String(formData.get("service") || "").trim();
    const budget = String(formData.get("budget") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      setError("Please fill in name, email, and message.");
      setStatus("error");
      return;
    }

    try {
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          companyEmail,
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
      {/* Name and Email */}
      <div className="flex w-full gap-6 flex-wrap sm:flex-nowrap">
        <motion.div 
          className="w-full flex flex-col group"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <label htmlFor="name" className="font-light text-lg mb-1">
            Name <span className="text-secondary">*</span>
          </label>
          <input
            name="name"
            type="text"
            placeholder="John Doe"
            id="name"
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary hover:border-foreground/40 transition-all duration-300 bg-transparent py-3 px-1"
            required
          />
        </motion.div>
        <motion.div 
          className="w-full flex flex-col group"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <label htmlFor="email" className="font-light text-lg mb-1">
            Personal Email <span className="text-secondary">*</span>
          </label>
          <input
            name="email"
            type="email"
            placeholder="john@gmail.com"
            id="email"
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary hover:border-foreground/40 transition-all duration-300 bg-transparent py-3 px-1"
            required
          />
        </motion.div>
      </div>

      {/* Company Email and Phone */}
      <div className="flex w-full gap-6 flex-wrap sm:flex-nowrap">
        <motion.div 
          className="w-full flex flex-col group"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <label htmlFor="companyEmail" className="font-light text-lg mb-1">
            Company Email
          </label>
          <input
            name="companyEmail"
            type="email"
            placeholder="john@company.com"
            id="companyEmail"
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary hover:border-foreground/40 transition-all duration-300 bg-transparent py-3 px-1"
          />
        </motion.div>
        <motion.div 
          className="w-full flex flex-col group"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <label htmlFor="phone" className="font-light text-lg mb-1">
            Phone Number
          </label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="outline-none border-b-2 border-foreground/20 focus:border-secondary hover:border-foreground/40 transition-all duration-300 bg-background py-3 px-2 cursor-pointer"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code} className="bg-background text-foreground">
                  {c.code} {c.country}
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
              className="flex-1 outline-none border-b-2 border-foreground/20 focus:border-secondary hover:border-foreground/40 transition-all duration-300 bg-transparent py-3 px-1"
            />
          </div>
        </motion.div>
      </div>

      {/* Service and Budget */}
      <div className="flex w-full gap-6 flex-wrap sm:flex-nowrap">
        <motion.div 
          className="w-full flex flex-col group"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <label htmlFor="service" className="font-light text-lg mb-1">
            Service Interested In
          </label>
          <select
            name="service"
            id="service"
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary hover:border-foreground/40 transition-all duration-300 bg-background py-3 px-1 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px_8px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
          >
            <option value="" className="bg-background text-foreground">
              Select Service...
            </option>
            {SERVICES.map((service) => (
              <option key={service} value={service} className="bg-background text-foreground">
                {service}
              </option>
            ))}
          </select>
        </motion.div>
        <motion.div 
          className="w-full flex flex-col group"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <label htmlFor="budget" className="font-light text-lg mb-1">
            Project Budget
          </label>
          <select
            name="budget"
            id="budget"
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary hover:border-foreground/40 transition-all duration-300 bg-background py-3 px-1 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px_8px] bg-[right_0.5rem_center] bg-no-repeat pr-8"
          >
            <option value="" className="bg-background text-foreground">
              Select Budget...
            </option>
            {BUDGETS.map((budget) => (
              <option key={budget} value={budget} className="bg-background text-foreground">
                {budget}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Message */}
      <motion.div
        className="group"
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        <label htmlFor="message" className="font-light text-lg mb-1 block">
          Message <span className="text-secondary">*</span>
        </label>
        <textarea
          name="message"
          id="message"
          rows={5}
          placeholder="Tell us more about your project..."
          className="w-full outline-none border-b-2 border-foreground/20 focus:border-secondary hover:border-foreground/40 transition-all duration-300 bg-transparent py-3 px-1 resize-none"
          required
        ></textarea>
      </motion.div>

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
        <motion.button
          type="submit"
          disabled={status === "submitting"}
          className="group relative px-8 py-4 bg-secondary text-white font-semibold rounded-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: status === "submitting" ? 1 : 1.05 }}
          whileTap={{ scale: status === "submitting" ? 1 : 0.95 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-secondary via-purple-600 to-secondary"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
          <span className="relative z-10 flex items-center gap-2">
            {status === "submitting" ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Sending...
              </>
            ) : (
              <>
                Send Message
                <HiPaperAirplane className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </>
            )}
          </span>
        </motion.button>
      </div>
    </form>
  );
};

export default ContactForm;


