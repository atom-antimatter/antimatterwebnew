"use client";

import { useState } from "react";
import { Vendor } from "@/data/vendorMatrix";

interface LeadCaptureFormProps {
  selectedVendors: Vendor[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LeadCaptureForm({ selectedVendors, onSuccess, onCancel }: LeadCaptureFormProps) {
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
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground mb-1">
          Let&apos;s connect
        </h3>
        <p className="text-sm text-foreground/60">
          Share a few details and someone from Antimatter will reach out.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Full name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:border-secondary transition-colors"
          required
        />

        <input
          type="email"
          placeholder="Work email *"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:border-secondary transition-colors"
          required
        />

        <input
          type="text"
          placeholder="Company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:border-secondary transition-colors"
        />

        <select
          value={formData.interest}
          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-foreground text-sm focus:outline-none focus:border-secondary transition-colors"
        >
          <option value="">What are you looking to deploy?</option>
          <option value="ai-agents">AI Agents</option>
          <option value="voice-agents">Voice Agents</option>
          <option value="genui-rag">GenUI / RAG</option>
          <option value="secure-onprem">Secure / On-Prem AI</option>
          <option value="not-sure">Not sure yet</option>
        </select>

        <textarea
          placeholder="Anything we should know?"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:border-secondary transition-colors resize-none"
        />

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
          >
            {isSubmitting ? "Sending..." : "Talk to Antimatter"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-foreground/60 hover:text-foreground text-sm transition-colors"
          >
            Not ready yet
          </button>
        </div>
      </form>
    </div>
  );
}

