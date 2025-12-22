"use client";

import { useState } from "react";
import { Vendor } from "@/data/vendorMatrix";
import CustomSelect from "@/components/ui/CustomSelect";
import Button from "@/components/ui/Button";

interface LeadCaptureFormProps {
  selectedVendors: Vendor[];
  userMessage?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const DEPLOYMENT_OPTIONS = [
  { value: "ai-agents", label: "AI Agents" },
  { value: "voice-agents", label: "Voice Agents" },
  { value: "genui-rag", label: "GenUI / RAG" },
  { value: "secure-onprem", label: "Secure / On-Prem AI" },
  { value: "not-sure", label: "Not sure yet" },
];

export default function LeadCaptureForm({ 
  selectedVendors, 
  userMessage,
  onSuccess, 
  onCancel 
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    interest: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email) {
      setError("Name and email are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/atom-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          comparingVendors: selectedVendors.map((v) => v.name),
          userMessage,
          context: {
            vendors: selectedVendors.map((v) => v.id),
            url: window.location.href,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      onSuccess();
    } catch (err) {
      console.error("Lead submission error:", err);
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground mb-1">
          Let&apos;s connect
        </h3>
        <p className="text-sm text-foreground/60">
          Share a few details and someone from Antimatter will reach out.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Full Name */}
        <div className="w-full flex flex-col">
          <label htmlFor="lead-name" className="font-light text-sm sm:text-base mb-1">
            Full name <span className="text-secondary">*</span>
          </label>
          <input
            type="text"
            id="lead-name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary transition-all duration-300 bg-transparent py-3 px-1"
            required
          />
        </div>

        {/* Work Email */}
        <div className="w-full flex flex-col">
          <label htmlFor="lead-email" className="font-light text-sm sm:text-base mb-1">
            Work email <span className="text-secondary">*</span>
          </label>
          <input
            type="email"
            id="lead-email"
            placeholder="john@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary transition-all duration-300 bg-transparent py-3 px-1"
            required
          />
        </div>

        {/* Company */}
        <div className="w-full flex flex-col">
          <label htmlFor="lead-company" className="font-light text-sm sm:text-base mb-1">
            Company
          </label>
          <input
            type="text"
            id="lead-company"
            placeholder="Acme Corp"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="outline-none border-b-2 border-foreground/20 focus:border-secondary transition-all duration-300 bg-transparent py-3 px-1"
          />
        </div>

        {/* What are you looking for? - Custom Dropdown (matches Contact page) */}
        <div className="w-full flex flex-col">
          <label htmlFor="lead-interest" className="font-light text-sm sm:text-base mb-1">
            What are you looking for?
          </label>
          <CustomSelect
            name="interest"
            id="lead-interest"
            placeholder="Select an option..."
            options={DEPLOYMENT_OPTIONS}
            value={formData.interest}
            onChange={(value) => setFormData({ ...formData, interest: value })}
          />
        </div>

        {/* Optional Message */}
        <div className="w-full flex flex-col">
          <label htmlFor="lead-notes" className="font-light text-sm sm:text-base mb-1">
            Anything we should know?
          </label>
          <textarea
            id="lead-notes"
            placeholder="Tell us more..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full outline-none border-b-2 border-foreground/20 focus:border-secondary transition-all duration-300 bg-transparent py-3 px-1 resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit Button - Using Contact Page Button Component */}
        <div className="flex">
          <Button type="submit" disabled={isSubmitting}>
            <span className="px-5">{isSubmitting ? "Sending..." : "Send Message"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
