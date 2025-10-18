"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { createClient } from "@supabase/supabase-js";

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      console.log("Supabase URL:", supabaseUrl);
      console.log("Supabase Key exists:", !!supabaseKey);

      if (!supabaseUrl || !supabaseKey) {
        setError("Supabase configuration missing. Please set environment variables.");
        setIsLoading(false);
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get admin password from database
      console.log("Fetching admin password from database...");
      const { data: settings, error: settingsError } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "admin_password")
        .single();

      console.log("Settings data:", settings);
      console.log("Settings error:", settingsError);

      if (settingsError) {
        setError(`Database error: ${settingsError.message}`);
        setIsLoading(false);
        return;
      }

      if (!settings) {
        setError("Admin password not found in database");
        setIsLoading(false);
        return;
      }

      if (password === settings.value) {
        console.log("Login successful!");
        onLogin();
      } else {
        setError("Invalid password");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Portal</h1>
            <p className="text-foreground/60">Enter password to access CMS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
