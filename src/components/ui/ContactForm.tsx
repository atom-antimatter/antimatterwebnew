"use client";
import { useCallback, useState } from "react";
import Button from "./Button";

type SubmitState = "idle" | "submitting" | "success" | "error";

const ContactForm = () => {
  const [status, setStatus] = useState<SubmitState>("idle");
  const [error, setError] = useState<string>("");

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const service = String(formData.get("service") || "").trim();
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
        body: JSON.stringify({ name, email, phone, service, message }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send message.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full mt-10 flex flex-col gap-6">
      <div className="flex w-full gap-6 flex-wrap sm:flex-nowrap">
        <div className="w-full flex flex-col">
          <label htmlFor="name" className="font-light text-lg">
            Name <span className="text-tertiary">*</span>
          </label>
          <input
            name="name"
            type="text"
            placeholder="John Doe"
            id="name"
            className="outline-none border-b border-foreground/20 focus:border-tertiary transition-all duration-300 bg-transparent py-2"
          />
        </div>
        <div className="w-full flex flex-col">
          <label htmlFor="email" className="font-light text-lg">
            Email <span className="text-tertiary">*</span>
          </label>
          <input
            name="email"
            type="email"
            placeholder="John@company.com"
            id="email"
            className="outline-none border-b border-foreground/20 focus:border-tertiary transition-all duration-300 bg-transparent py-2"
          />
        </div>
      </div>
      <div className="flex w-full gap-6 flex-wrap sm:flex-nowrap">
        <div className="w-full flex flex-col">
          <label htmlFor="phone" className="font-light text-lg">
            Phone Number
          </label>
          <input
            name="phone"
            type="text"
            placeholder="+1 (555) 123-4567"
            id="phone"
            className="outline-none border-b border-foreground/20 focus:border-tertiary transition-all duration-300 bg-transparent py-2"
          />
        </div>
        <div className="w-full flex flex-col">
          <label htmlFor="service" className="font-light text-lg">
            What are you looking for?
          </label>
          <select
            name="service"
            id="service"
            className="outline-none border-b border-foreground/20 focus:border-tertiary transition-all duration-300 bg-transparent py-2"
          >
            <option value="" className="text-black">
              Select Service...
            </option>
            <option value="web-development" className="text-black">
              Web Development
            </option>
            <option value="ai-solutions" className="text-black">
              AI Solutions
            </option>
            <option value="design-agency" className="text-black">
              Design Agency
            </option>
            <option value="digital-marketing" className="text-black">
              Digital Marketing
            </option>
            <option value="web3-development" className="text-black">
              Web3 Development
            </option>
            <option value="security-solutions" className="text-black">
              Security Solutions
            </option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="message" className="font-light text-lg">
          Message <span className="text-tertiary">*</span>
        </label>
        <textarea
          name="message"
          id="message"
          rows={5}
          placeholder="Tell us more about your project..."
          className="w-full outline-none border-b border-foreground/20 focus:border-tertiary transition-all duration-300 bg-transparent py-2"
        ></textarea>
      </div>
      {status === "error" && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {status === "success" && (
        <p className="text-green-500 text-sm">Message sent! We&apos;ll be in touch.</p>
      )}
      <div className="flex">
        <Button type="submit" disabled={status === "submitting"}>
          <span className="px-5">{status === "submitting" ? "Sending..." : "Send Message"}</span>
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;


