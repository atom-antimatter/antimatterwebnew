import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with service role key for admin operations
 * ONLY use this on the server side (API routes, server components)
 */
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin configuration missing");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Upload an image to Supabase Storage (server-side)
 * @param file - The file buffer
 * @param fileName - The desired file name
 * @param contentType - The MIME type of the file
 */
export const uploadBlogImageServer = async (
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; path: string } | { error: string }> => {
  try {
    const supabase = getSupabaseAdmin();
    const fileExt = fileName.split(".").pop() || "jpg";
    const filePath = `blog-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image (server):", error);
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
    console.error("Exception uploading image (server):", err);
    return { error: err.message || "Failed to upload image" };
  }
};

