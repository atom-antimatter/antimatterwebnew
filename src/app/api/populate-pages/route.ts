import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface PageData {
  slug: string;
  title: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  no_index?: boolean;
  is_homepage?: boolean;
  category?: string;
  parent_slug?: string;
}

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key for server-side operations that need to bypass RLS
  // Service role key provided by user
  const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbGNtZHBua3pnd3Z3c254bGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY4NjMxMCwiZXhwIjoyMDc0MjYyMzEwfQ.zeVKENE9mXTdUjv51UwTid2GCLPA3cQZj5h8B9mLqHo";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || serviceRoleKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });
};

// Define all pages in the site
const allPages: PageData[] = [
  {
    slug: "/",
    title: "Antimatter AI - Building Digital Solutions That Matter",
    meta_description:
      "Antimatter AI designs and builds high-impact AI products, secure platforms, and modern web experiences.",
    is_homepage: true,
    category: "main",
  },
  {
    slug: "/work",
    title: "Our Work - Antimatter AI",
    meta_description:
      "Explore our portfolio of AI solutions, web applications, and digital products that drive real results.",
    category: "main",
  },
  {
    slug: "/company",
    title: "About Antimatter AI - Our Story & Team",
    meta_description:
      "Learn about Antimatter AI - our mission, team, and approach to building innovative digital solutions.",
    category: "main",
  },
  {
    slug: "/contact",
    title: "Contact Us - Antimatter AI",
    meta_description:
      "Get in touch with Antimatter AI. Let's discuss your next project and how we can help bring your vision to life.",
    category: "main",
  },
  // Service pages
  {
    slug: "/design-agency",
    title: "Product Design Services - Antimatter AI",
    meta_description:
      "Expert product design services from initial sketches to fully custom apps. Modern design with cutting-edge tools.",
    category: "services",
  },
  {
    slug: "/development-agency",
    title: "Software Development Services - Antimatter AI",
    meta_description:
      "Professional software development across all platforms. React, Next.js, Node, Flutter, and more.",
    category: "services",
  },
  {
    slug: "/gtm-strategy",
    title: "Go-To-Market Strategy Services - Antimatter AI",
    meta_description:
      "Drive conversions with strategic GTM planning, positioning, messaging, and demand generation campaigns.",
    category: "services",
  },
  {
    slug: "/ai-development",
    title: "AI Development Services - Antimatter AI",
    meta_description:
      "Advanced AI development with LLM apps, fine-tuning, vision, NLP, and speech pipelines.",
    category: "services",
  },
  {
    slug: "/healthcare-apps",
    title: "Healthcare App Development - HIPAA Compliant - Antimatter AI",
    meta_description:
      "Secure, HIPAA-compliant healthcare software with telehealth, EHR integrations, and patient portals.",
    category: "services",
  },
  {
    slug: "/iot-development",
    title: "IoT Development Services - Antimatter AI",
    meta_description:
      "End-to-end IoT development with embedded firmware, connectivity, MQTT, edge AI, and OTA updates.",
    category: "services",
  },
  {
    slug: "/voice-agents",
    title: "Voice Agent Development - AI Call Centers - Antimatter AI",
    meta_description:
      "Build voice agents powered by OpenAI Realtime API, Hume EVI, and leading providers. Natural AI conversations 24/7.",
    category: "solutions",
  },
  {
    slug: "/emotion-ai",
    title: "Sentiment AI for Data-Driven Decisions | Antimatter AI",
    meta_description:
      "Transform emotional data into business intelligence. Analyze customer calls, employee feedback, and user interactions to make informed decisions that drive growth and retention.",
    category: "solutions",
  },
  // Demo pages
  {
    slug: "/voice-agent-demo",
    title: "Try Antimatter Voice Agent Demo",
    meta_description:
      "Experience our AI-powered voice agent trained on Antimatter AI's knowledge base. Natural conversations powered by advanced AI.",
    category: "demo",
  },
  {
    slug: "/emotion-tracking-demo",
    title: "AI Emotion Tracking Demo - Antimatter AI",
    meta_description:
      "Experience real-time facial expression tracking and text analysis with our custom sentiment AI built on Hume and GPT-5.",
    category: "demo",
  },
  {
    slug: "/emotion-tracking",
    title: "Emotion Tracking Solutions - Antimatter AI",
    meta_description:
      "Advanced emotion tracking and sentiment analysis solutions for customer insights and engagement.",
    category: "solutions",
  },
  // Case studies
  {
    slug: "/case-study/clinixAI",
    title: "Clinix AI Case Study - Healthcare AI Platform",
    meta_description:
      "How we built Clinix AI - a comprehensive healthcare AI platform transforming patient care and clinical workflows.",
    category: "case-study",
    parent_slug: undefined, // Can be set to "/case-study" if parent page exists
  },
  {
    slug: "/case-study/synergies4",
    title: "Synergies4 Case Study - Enterprise Solution",
    meta_description:
      "Synergies4 case study - building scalable enterprise solutions with modern technology.",
    category: "case-study",
    parent_slug: undefined,
  },
  {
    slug: "/case-study/curehire",
    title: "Curehire Case Study - Healthcare Recruitment Platform",
    meta_description:
      "Curehire case study - revolutionizing healthcare recruitment with AI-powered matching and automation.",
    category: "case-study",
    parent_slug: undefined,
  },
  {
    slug: "/case-study/feature",
    title: "Feature Case Study - Product Innovation",
    meta_description:
      "Feature case study - delivering innovative product solutions with cutting-edge technology.",
    category: "case-study",
    parent_slug: undefined,
  },
  {
    slug: "/case-study/owasp",
    title: "OWASP Security Project Case Study",
    meta_description:
      "OWASP case study - implementing enterprise-grade security solutions and compliance frameworks.",
    category: "case-study",
    parent_slug: undefined,
  },
];

export async function POST() {
  try {
    const supabase = getSupabase();
    
    // Get existing pages count for reporting
    let existingPages: any[] = [];
    let existingSlugs = new Set<string>();
    
    try {
      const { data, error: fetchError } = await supabase
        .from("pages")
        .select("slug");
      
      if (fetchError) {
        console.error("Error fetching existing pages:", fetchError);
        // Continue anyway - we'll insert all and handle duplicates
      } else {
        existingPages = data || [];
        existingSlugs = new Set(existingPages.map(p => p.slug));
      }
    } catch (err) {
      console.error("Error in fetch existing pages:", err);
      // Continue with insert anyway
    }
    
    // Try to insert all pages - handle duplicates gracefully
    const pagesToInsert = allPages;
    const existingPagesCount = existingPages.length;
    
    // If all pages exist, still return success (they're already there)
    if (existingSlugs.size === allPages.length) {
      return NextResponse.json({ 
        success: true, 
        message: "All pages already exist",
        count: 0,
        skipped: existingPagesCount
      });
    }
    
    // Insert all pages using RPC function - bypasses schema cache issues
    const insertedPages: string[] = [];
    const errors: any[] = [];
    const skippedPages: string[] = [];
    
    for (const page of pagesToInsert) {
      const isExisting = existingSlugs.has(page.slug);
      
      // Skip if already exists and we don't want to force update
      if (isExisting) {
        skippedPages.push(page.slug);
        continue;
      }
      
      try {
        // Build RPC parameters object - explicitly map all fields
        const rpcParams = {
          p_slug: page.slug,
          p_title: page.title,
          p_meta_description: (page.meta_description && page.meta_description.trim()) || null,
          p_meta_keywords: (page.meta_keywords && page.meta_keywords.trim()) || null,
          p_canonical_url: (page.canonical_url && page.canonical_url.trim()) || null,
          p_og_title: (page.og_title && page.og_title.trim()) || null,
          p_og_description: (page.og_description && page.og_description.trim()) || null,
          p_og_image: (page.og_image && page.og_image.trim()) || null,
          p_twitter_title: (page.twitter_title && page.twitter_title.trim()) || null,
          p_twitter_description: (page.twitter_description && page.twitter_description.trim()) || null,
          p_twitter_image: (page.twitter_image && page.twitter_image.trim()) || null,
          p_no_index: page.no_index ?? false,
          p_is_homepage: page.is_homepage ?? false,
          p_category: (page.category && page.category.trim()) || null,
          p_internal_links: null, // Will be populated later via CMS or auto-analysis
          p_parent_slug: (page.parent_slug && page.parent_slug.trim()) || null,
        };
        
        // WORKAROUND: PostgREST schema cache doesn't recognize new columns yet
        // Insert without category/parent_slug/internal_links first, then update via SQL
        const insertData: Record<string, any> = {
          slug: rpcParams.p_slug,
          title: rpcParams.p_title,
          meta_description: rpcParams.p_meta_description,
          meta_keywords: rpcParams.p_meta_keywords,
          canonical_url: rpcParams.p_canonical_url,
          og_title: rpcParams.p_og_title,
          og_description: rpcParams.p_og_description,
          og_image: rpcParams.p_og_image,
          twitter_title: rpcParams.p_twitter_title,
          twitter_description: rpcParams.p_twitter_description,
          twitter_image: rpcParams.p_twitter_image,
          no_index: rpcParams.p_no_index,
          is_homepage: rpcParams.p_is_homepage,
        };
        
        // Only include fields that PostgREST definitely knows about
        // Category, parent_slug, internal_links will be NULL initially
        // These can be updated via admin panel after PostgREST cache refreshes
        let insertResult: { id: string } | null = null;
        const { data: resultData, error: insertError } = await supabase
          .schema('public')
          .from("pages")
          .upsert(insertData, { onConflict: 'slug' })
          .select('id')
          .single();
        
        if (insertError) {
          // If insert fails, try without schema specification as fallback
          const { data: fallbackResult, error: fallbackError } = await supabase
            .from("pages")
            .upsert(insertData, { onConflict: 'slug' })
            .select('id')
            .single();
          
          if (fallbackError) {
            console.error(`Error inserting/updating page ${page.slug}:`, fallbackError);
            console.error(`Data attempted:`, JSON.stringify(insertData, null, 2));
            errors.push({ 
              slug: page.slug, 
              error: fallbackError.message,
              details: fallbackError,
              code: fallbackError.code,
              hint: fallbackError.hint
            });
            continue;
          }
          
          insertResult = fallbackResult;
        } else {
          insertResult = resultData;
        }
        
        if (insertResult && insertResult.id) {
          insertedPages.push(page.slug);
          
          // NOTE: category, parent_slug, internal_links are NOT set here
          // PostgREST schema cache doesn't recognize these columns yet
          // These fields can be updated via the admin panel after pages are synced
          // The pages are successfully inserted/updated with all other SEO fields
          console.log(`Successfully inserted/updated page: ${page.slug} (ID: ${insertResult.id})`);
          console.log(`Note: category/parent_slug/internal_links will be NULL initially. Update via admin panel once PostgREST cache refreshes.`);
        } else {
          console.warn(`No data returned for page ${page.slug} (but no error)`);
          errors.push({ slug: page.slug, error: "No data returned from upsert" });
        }
      } catch (err: any) {
        console.error(`Error inserting page ${page.slug}:`, err);
        console.error(`Page data attempted:`, JSON.stringify(page, null, 2));
        errors.push({ slug: page.slug, error: err.message || "Unknown error", stack: err.stack });
      }
    }
    
    if (insertedPages.length === 0 && errors.length > 0 && skippedPages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to insert pages. ${errors.length} errors occurred.`,
          details: errors,
          attemptedCount: pagesToInsert.length,
        },
        { status: 500 }
      );
    }
    
    // Build response message
    let message = "";
    if (insertedPages.length > 0) {
      message = `Successfully inserted ${insertedPages.length} new pages`;
    }
    if (skippedPages.length > 0) {
      message += message ? `, skipped ${skippedPages.length} existing pages` : `Skipped ${skippedPages.length} existing pages`;
    }
    if (errors.length > 0) {
      message += message ? `, ${errors.length} errors occurred` : `${errors.length} errors occurred`;
    }
    
    if (errors.length > 0) {
      return NextResponse.json({
        success: true,
        message: message || "Partially successful",
        count: insertedPages.length,
        skipped: skippedPages.length,
        insertedPages: insertedPages,
        errors: errors,
        skippedPages: skippedPages,
        warnings: true,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: message || `Successfully populated ${insertedPages.length} pages`,
      count: insertedPages.length,
      skipped: skippedPages.length,
      insertedPages: insertedPages,
      skippedPages: skippedPages,
    });
  } catch (error: any) {
    console.error("Error populating pages:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error occurred",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check what pages exist
export async function GET() {
  try {
    const supabase = getSupabase();
    
    // Fetch all pages - sort client-side to avoid schema cache issues
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("is_homepage", { ascending: false })
      .order("slug");
    
    if (error) throw error;
    
    // Sort by category in JavaScript if data exists
    if (data) {
      data.sort((a, b) => {
        // Homepage first
        if (a.is_homepage && !b.is_homepage) return -1;
        if (!a.is_homepage && b.is_homepage) return 1;
        
        // Then by category if available
        if (a.category && b.category && a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        
        // Finally by slug
        return a.slug.localeCompare(b.slug);
      });
    }
    
    return NextResponse.json({
      success: true,
      totalPages: data?.length || 0,
      pages: data,
      availablePages: allPages.length,
    });
  } catch (error: any) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

