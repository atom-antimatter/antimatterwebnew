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

/**
 * Upload an image to Supabase Storage blog-images bucket
 * @param file - The file to upload
 * @param path - Optional path within the bucket (defaults to timestamp-based name)
 * @returns The public URL of the uploaded image
 */
export const uploadBlogImage = async (
  file: File,
  path?: string
): Promise<{ url: string; path: string } | { error: string }> => {
  try {
    const supabase = getSupabaseClient();
    const fileExt = file.name.split(".").pop();
    const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      return { error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error("Exception uploading image:", err);
    return { error: err.message || "Failed to upload image" };
  }
};

/**
 * Delete an image from Supabase Storage
 * @param path - The path of the image in storage
 */
export const deleteBlogImage = async (path: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage.from("blog-images").remove([path]);

    if (error) {
      console.error("Error deleting image:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Exception deleting image:", err);
    return { success: false, error: err.message || "Failed to delete image" };
  }
};

/**
 * Get public URL for a stored image
 * @param path - The path of the image in storage
 */
export const getBlogImageUrl = (path: string): string => {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
};

