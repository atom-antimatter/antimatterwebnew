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
  },
  {
    slug: "/case-study/synergies4",
    title: "Synergies4 Case Study - Enterprise Solution",
    meta_description:
      "Synergies4 case study - building scalable enterprise solutions with modern technology.",
    category: "case-study",
  },
  {
    slug: "/case-study/curehire",
    title: "Curehire Case Study - Healthcare Recruitment Platform",
    meta_description:
      "Curehire case study - revolutionizing healthcare recruitment with AI-powered matching and automation.",
    category: "case-study",
  },
  {
    slug: "/case-study/feature",
    title: "Feature Case Study - Product Innovation",
    meta_description:
      "Feature case study - delivering innovative product solutions with cutting-edge technology.",
    category: "case-study",
  },
  {
    slug: "/case-study/owasp",
    title: "OWASP Security Project Case Study",
    meta_description:
      "OWASP case study - implementing enterprise-grade security solutions and compliance frameworks.",
    category: "case-study",
  },
];

export async function POST() {
  try {
    const supabase = getSupabase();
    
    // Refresh schema cache by doing a full select first
    const { error: schemaError } = await supabase
      .from("pages")
      .select("*")
      .limit(0);
    
    if (schemaError && !schemaError.message.includes("relation") && !schemaError.message.includes("does not exist")) {
      console.warn("Schema cache refresh warning:", schemaError);
    }
    
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
    
    // Insert all pages - do one at a time to avoid schema cache issues
    // Handle duplicates gracefully (skip if exists)
    const insertedPages = [];
    const errors = [];
    const skippedPages = [];
    
    for (const page of pagesToInsert) {
      // Skip if already exists (unless we want to force update)
      if (existingSlugs.has(page.slug)) {
        skippedPages.push(page.slug);
        continue;
      }
      try {
        // Map page data with explicit field names matching database schema
        // Convert empty strings to null for optional fields
        const pageData = {
          slug: page.slug,
          title: page.title,
          meta_description: (page.meta_description && page.meta_description.trim()) || null,
          meta_keywords: (page.meta_keywords && page.meta_keywords.trim()) || null,
          canonical_url: (page.canonical_url && page.canonical_url.trim()) || null,
          og_title: (page.og_title && page.og_title.trim()) || null,
          og_description: (page.og_description && page.og_description.trim()) || null,
          og_image: (page.og_image && page.og_image.trim()) || null,
          twitter_title: (page.twitter_title && page.twitter_title.trim()) || null,
          twitter_description: (page.twitter_description && page.twitter_description.trim()) || null,
          twitter_image: (page.twitter_image && page.twitter_image.trim()) || null,
          no_index: page.no_index ?? false,
          is_homepage: page.is_homepage ?? false,
          category: (page.category && page.category.trim()) || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Insert new page - use insert (not upsert) to only add new pages
        // Existing pages will only be updated when explicitly edited in admin portal
        const { data, error } = await supabase
          .from("pages")
          .insert([pageData])
          .select();
        
        if (error) {
          // Handle duplicate key errors gracefully (page already exists)
          if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
            console.log(`Page ${page.slug} already exists (duplicate key), skipping...`);
            skippedPages.push(page.slug);
            // Don't count as error - page already exists, which is fine
          } else {
            console.error(`Error inserting page ${page.slug}:`, error);
            console.error(`Page data attempted:`, JSON.stringify(pageData, null, 2));
            errors.push({ 
              slug: page.slug, 
              error: error.message,
              details: error,
              code: error.code,
              hint: error.hint
            });
          }
        } else if (data && data.length > 0) {
          insertedPages.push(...data);
          console.log(`Successfully inserted page: ${page.slug}`);
        } else {
          console.warn(`No data returned for page ${page.slug} (but no error)`);
          errors.push({ slug: page.slug, error: "No data returned from insert" });
        }
      } catch (err: any) {
        console.error(`Error inserting page ${page.slug}:`, err);
        console.error(`Page data attempted:`, JSON.stringify(page, null, 2));
        errors.push({ slug: page.slug, error: err.message, stack: err.stack });
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
      message = `Successfully added ${insertedPages.length} pages`;
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
        pages: insertedPages,
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
      pages: insertedPages,
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
    
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .order("category")
      .order("slug");
    
    if (error) throw error;
    
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

