"use client";

import { createClient } from "@supabase/supabase-js";

// Singleton Supabase client to avoid multiple GoTrueClient instances
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
};

