"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const auth = localStorage.getItem("admin_auth");
      if (auth === "authenticated") {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("admin_auth", "authenticated");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isAuthenticated ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}
