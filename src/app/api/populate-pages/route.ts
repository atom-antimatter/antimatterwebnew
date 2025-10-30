import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ServicesData } from "@/data/services";

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }

  return createClient(supabaseUrl, supabaseKey);
};

// Define all pages in the site
const allPages = [
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

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    
    // First, get existing pages to avoid duplicates
    const { data: existingPages, error: fetchError } = await supabase
      .from("pages")
      .select("slug");
    
    if (fetchError) throw fetchError;
    
    const existingSlugs = new Set(existingPages?.map(p => p.slug) || []);
    
    // Filter out pages that already exist
    const newPages = allPages.filter(page => !existingSlugs.has(page.slug));
    
    if (newPages.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "All pages already exist",
        count: 0 
      });
    }
    
    // Insert new pages
    const pagesWithDefaults = newPages.map(page => ({
      ...page,
      no_index: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    const { data, error } = await supabase
      .from("pages")
      .insert(pagesWithDefaults)
      .select();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: `Successfully populated ${newPages.length} pages`,
      count: newPages.length,
      pages: data,
    });
  } catch (error: any) {
    console.error("Error populating pages:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
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

