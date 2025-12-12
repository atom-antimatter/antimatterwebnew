"use client";
import { useState } from "react";
import { motion } from "motion/react";
import TransitionLink from "@/components/ui/TransitionLink";
import { HiMicrophone, HiArrowLeft } from "react-icons/hi2";

export default function AtomVoicePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with contact API
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-main mx-auto py-20 text-center">
        <TransitionLink
          href="/"
          className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition mb-8"
        >
          <HiArrowLeft className="size-4" />
          Back to Home
        </TransitionLink>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <HiMicrophone className="size-10 text-primary" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold">
            Atom <span className="text-primary">Voice</span>
          </h1>

          <p className="text-xl md:text-2xl opacity-70 max-w-2xl">
            AI-powered voice agent and assistant. Transform conversations with
            intelligent, natural-sounding AI interactions.
          </p>

          <div className="mt-8 w-full max-w-md">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="text-sm opacity-60">
                  Coming Soon. Be the first to know when we launch.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary transition"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary hover:bg-primary/80 rounded-lg font-semibold transition"
                >
                  Notify Me
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-primary font-semibold"
              >
                ✓ Thank you! We'll be in touch soon.
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

