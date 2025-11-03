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

// Define all pages in the site with optimized SEO metadata
const allPages: PageData[] = [
  {
    slug: "/",
    title: "Antimatter AI - Building Digital Solutions That Matter",
    meta_description:
      "Antimatter AI designs and builds high-impact AI products, secure platforms, and modern web experiences. Transform your business with custom AI solutions, product design, and development services.",
    meta_keywords: "AI development, product design, software development, web development, AI solutions, custom software, digital transformation",
    canonical_url: "https://www.antimatterai.com/",
    og_title: "Antimatter AI — Digital Solutions That Matter",
    og_description: "We empower organizations with AI that turns complex challenges into real-world outcomes.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Antimatter AI — Digital Solutions That Matter",
    twitter_description: "We empower organizations with AI that turns complex challenges into real-world outcomes.",
    twitter_image: "/images/HeroOpenGraph.png",
    is_homepage: true,
    category: "main",
  },
  {
    slug: "/work",
    title: "Our Work | Portfolio - AI Solutions & Digital Products | Antimatter AI",
    meta_description:
      "Explore our portfolio of AI solutions, web applications, and digital products that drive real results. See case studies from healthcare, enterprise, and security sectors.",
    meta_keywords: "portfolio, case studies, AI solutions, digital products, web applications, work examples",
    canonical_url: "https://www.antimatterai.com/work",
    og_title: "Our Work - Antimatter AI",
    og_description: "Explore our portfolio of AI solutions, web applications, and digital products that drive real results.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Our Work - Antimatter AI",
    twitter_description: "Explore our portfolio of AI solutions, web applications, and digital products that drive real results.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "main",
  },
  {
    slug: "/company",
    title: "About Us | Our Story & Team | Antimatter AI",
    meta_description:
      "Learn about Antimatter AI - our mission, team, and approach to building innovative digital solutions. Based in Atlanta, GA, serving clients globally.",
    meta_keywords: "about us, team, mission, company culture, Atlanta, digital solutions",
    canonical_url: "https://www.antimatterai.com/company",
    og_title: "About Antimatter AI - Our Story & Team",
    og_description: "Learn about Antimatter AI - our mission, team, and approach to building innovative digital solutions.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "About Antimatter AI - Our Story & Team",
    twitter_description: "Learn about Antimatter AI - our mission, team, and approach to building innovative digital solutions.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "main",
  },
  {
    slug: "/contact",
    title: "Contact Us | Get Started | Antimatter AI",
    meta_description:
      "Get in touch with Antimatter AI. Let's discuss your next project and how we can help bring your vision to life. Contact us at atom@antimatterai.com",
    meta_keywords: "contact, get in touch, quote, consultation, project inquiry",
    canonical_url: "https://www.antimatterai.com/contact",
    og_title: "Contact Us - Antimatter AI",
    og_description: "Get in touch with Antimatter AI. Let's discuss your next project and how we can help bring your vision to life.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Contact Us - Antimatter AI",
    twitter_description: "Get in touch with Antimatter AI. Let's discuss your next project and how we can help bring your vision to life.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "main",
  },
  // Service pages
  {
    slug: "/design-agency",
    title: "Product Design Services | UI/UX Design Agency | Antimatter AI",
    meta_description:
      "Expert product design services from initial sketches to fully custom apps. Modern design with cutting-edge tools. Transform your ideas into beautiful, user-centered digital experiences.",
    meta_keywords: "product design, UI design, UX design, app design, web design, design agency, user experience",
    canonical_url: "https://www.antimatterai.com/design-agency",
    og_title: "Product Design Services - Antimatter AI",
    og_description: "Expert product design services from initial sketches to fully custom apps. Modern design with cutting-edge tools.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Product Design Services - Antimatter AI",
    twitter_description: "Expert product design services from initial sketches to fully custom apps. Modern design with cutting-edge tools.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "services",
  },
  {
    slug: "/development-agency",
    title: "Software Development Services | Custom Development | Antimatter AI",
    meta_description:
      "Professional software development across all platforms. React, Next.js, Node, Flutter, and more. Build scalable, high-performance applications tailored to your needs.",
    meta_keywords: "software development, web development, app development, React, Next.js, Node.js, Flutter, custom software",
    canonical_url: "https://www.antimatterai.com/development-agency",
    og_title: "Software Development Services - Antimatter AI",
    og_description: "Professional software development across all platforms. React, Next.js, Node, Flutter, and more.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Software Development Services - Antimatter AI",
    twitter_description: "Professional software development across all platforms. React, Next.js, Node, Flutter, and more.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "services",
  },
  {
    slug: "/gtm-strategy",
    title: "Go-To-Market Strategy Services | GTM Consulting | Antimatter AI",
    meta_description:
      "Drive conversions with strategic GTM planning, positioning, messaging, and demand generation campaigns. Launch your product successfully with proven strategies.",
    meta_keywords: "GTM strategy, go-to-market, product launch, marketing strategy, positioning, demand generation",
    canonical_url: "https://www.antimatterai.com/gtm-strategy",
    og_title: "Go-To-Market Strategy Services - Antimatter AI",
    og_description: "Drive conversions with strategic GTM planning, positioning, messaging, and demand generation campaigns.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Go-To-Market Strategy Services - Antimatter AI",
    twitter_description: "Drive conversions with strategic GTM planning, positioning, messaging, and demand generation campaigns.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "services",
  },
  {
    slug: "/ai-development",
    title: "AI Development Services | LLM & Machine Learning | Antimatter AI",
    meta_description:
      "Advanced AI development with LLM apps, fine-tuning, vision, NLP, and speech pipelines. Build intelligent solutions that transform your business.",
    meta_keywords: "AI development, LLM, machine learning, NLP, computer vision, speech recognition, AI consulting",
    canonical_url: "https://www.antimatterai.com/ai-development",
    og_title: "AI Development Services - Antimatter AI",
    og_description: "Advanced AI development with LLM apps, fine-tuning, vision, NLP, and speech pipelines.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "AI Development Services - Antimatter AI",
    twitter_description: "Advanced AI development with LLM apps, fine-tuning, vision, NLP, and speech pipelines.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "services",
  },
  {
    slug: "/healthcare-apps",
    title: "Healthcare App Development | HIPAA Compliant Software | Antimatter AI",
    meta_description:
      "Secure, HIPAA-compliant healthcare software with telehealth, EHR integrations, and patient portals. Build trusted healthcare applications that improve patient care.",
    meta_keywords: "healthcare apps, HIPAA compliant, telehealth, EHR integration, patient portals, healthcare software",
    canonical_url: "https://www.antimatterai.com/healthcare-apps",
    og_title: "Healthcare App Development - HIPAA Compliant - Antimatter AI",
    og_description: "Secure, HIPAA-compliant healthcare software with telehealth, EHR integrations, and patient portals.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Healthcare App Development - HIPAA Compliant - Antimatter AI",
    twitter_description: "Secure, HIPAA-compliant healthcare software with telehealth, EHR integrations, and patient portals.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "services",
  },
  {
    slug: "/iot-development",
    title: "IoT Development Services | Internet of Things Solutions | Antimatter AI",
    meta_description:
      "End-to-end IoT development with embedded firmware, connectivity, MQTT, edge AI, and OTA updates. Connect devices, collect data, and build smart solutions.",
    meta_keywords: "IoT development, Internet of Things, embedded systems, MQTT, edge computing, smart devices, firmware",
    canonical_url: "https://www.antimatterai.com/iot-development",
    og_title: "IoT Development Services - Antimatter AI",
    og_description: "End-to-end IoT development with embedded firmware, connectivity, MQTT, edge AI, and OTA updates.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "IoT Development Services - Antimatter AI",
    twitter_description: "End-to-end IoT development with embedded firmware, connectivity, MQTT, edge AI, and OTA updates.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "services",
  },
  {
    slug: "/voice-agents",
    title: "Voice Agent Development | AI Call Centers & Conversational AI | Antimatter AI",
    meta_description:
      "Build voice agents powered by OpenAI Realtime API, Hume EVI, and leading providers. Natural AI conversations 24/7. Transform customer service with intelligent voice assistants.",
    meta_keywords: "voice agents, AI call centers, conversational AI, voice assistants, customer service automation, OpenAI, Hume EVI",
    canonical_url: "https://www.antimatterai.com/voice-agents",
    og_title: "Voice Agent Development - AI Call Centers - Antimatter AI",
    og_description: "Build voice agents powered by OpenAI Realtime API, Hume EVI, and leading providers. Natural AI conversations 24/7.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Voice Agent Development - AI Call Centers - Antimatter AI",
    twitter_description: "Build voice agents powered by OpenAI Realtime API, Hume EVI, and leading providers. Natural AI conversations 24/7.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "solutions",
  },
  {
    slug: "/emotion-ai",
    title: "Sentiment AI for Data-Driven Decisions | Business Intelligence | Antimatter AI",
    meta_description:
      "Transform emotional data into business intelligence. Analyze customer calls, employee feedback, and user interactions to make informed decisions that drive growth and retention.",
    meta_keywords: "sentiment AI, emotion analysis, business intelligence, customer sentiment, employee feedback, data analytics",
    canonical_url: "https://www.antimatterai.com/emotion-ai",
    og_title: "Sentiment AI for Data-Driven Decisions | Antimatter AI",
    og_description: "Transform emotional data into business intelligence. Analyze customer calls, employee feedback, and user interactions.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Sentiment AI for Data-Driven Decisions | Antimatter AI",
    twitter_description: "Transform emotional data into business intelligence. Analyze customer calls, employee feedback, and user interactions.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "solutions",
  },
  // Demo pages
  {
    slug: "/voice-agent-demo",
    title: "Try Antimatter Voice Agent Demo | Interactive AI Assistant",
    meta_description:
      "Experience our AI-powered voice agent trained on Antimatter AI's knowledge base. Natural conversations powered by advanced AI. Test the future of customer service.",
    meta_keywords: "voice agent demo, AI assistant demo, conversational AI demo, interactive demo",
    canonical_url: "https://www.antimatterai.com/voice-agent-demo",
    og_title: "Try Antimatter Voice Agent Demo",
    og_description: "Experience our AI-powered voice agent trained on Antimatter AI's knowledge base. Natural conversations powered by advanced AI.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Try Antimatter Voice Agent Demo",
    twitter_description: "Experience our AI-powered voice agent trained on Antimatter AI's knowledge base. Natural conversations powered by advanced AI.",
    twitter_image: "/images/HeroOpenGraph.png",
    no_index: true, // Demo pages shouldn't be indexed
    category: "demo",
  },
  {
    slug: "/emotion-tracking-demo",
    title: "AI Emotion Tracking Demo | Facial Expression & Sentiment Analysis",
    meta_description:
      "Experience real-time facial expression tracking and text analysis with our custom sentiment AI built on Hume and GPT-5. See how emotion AI works in action.",
    meta_keywords: "emotion tracking demo, sentiment analysis demo, facial expression tracking, AI demo",
    canonical_url: "https://www.antimatterai.com/emotion-tracking-demo",
    og_title: "AI Emotion Tracking Demo - Antimatter AI",
    og_description: "Experience real-time facial expression tracking and text analysis with our custom sentiment AI built on Hume and GPT-5.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "AI Emotion Tracking Demo - Antimatter AI",
    twitter_description: "Experience real-time facial expression tracking and text analysis with our custom sentiment AI built on Hume and GPT-5.",
    twitter_image: "/images/HeroOpenGraph.png",
    no_index: true, // Demo pages shouldn't be indexed
    category: "demo",
  },
  {
    slug: "/emotion-tracking",
    title: "Emotion Tracking Solutions | Sentiment Analysis Services | Antimatter AI",
    meta_description:
      "Advanced emotion tracking and sentiment analysis solutions for customer insights and engagement. Understand your audience better with AI-powered emotion detection.",
    meta_keywords: "emotion tracking, sentiment analysis, customer insights, engagement analytics, emotion detection",
    canonical_url: "https://www.antimatterai.com/emotion-tracking",
    og_title: "Emotion Tracking Solutions - Antimatter AI",
    og_description: "Advanced emotion tracking and sentiment analysis solutions for customer insights and engagement.",
    og_image: "/images/HeroOpenGraph.png",
    twitter_title: "Emotion Tracking Solutions - Antimatter AI",
    twitter_description: "Advanced emotion tracking and sentiment analysis solutions for customer insights and engagement.",
    twitter_image: "/images/HeroOpenGraph.png",
    category: "solutions",
  },
  // Case studies
  {
    slug: "/case-study/clinixAI",
    title: "Clinix AI Case Study | Healthcare AI Platform Development | Antimatter AI",
    meta_description:
      "How we built Clinix AI - a comprehensive healthcare AI platform transforming patient care and clinical workflows. Learn about our approach to healthcare technology innovation.",
    meta_keywords: "Clinix AI, healthcare AI, case study, healthcare platform, clinical workflows, patient care technology",
    canonical_url: "https://www.antimatterai.com/case-study/clinixAI",
    og_title: "Clinix AI Case Study - Healthcare AI Platform",
    og_description: "How we built Clinix AI - a comprehensive healthcare AI platform transforming patient care and clinical workflows.",
    og_image: "/images/CaseStudies/clinix/clinixai.jpg",
    twitter_title: "Clinix AI Case Study - Healthcare AI Platform",
    twitter_description: "How we built Clinix AI - a comprehensive healthcare AI platform transforming patient care and clinical workflows.",
    twitter_image: "/images/CaseStudies/clinix/clinixai.jpg",
    category: "case-study",
    parent_slug: "/work",
  },
  {
    slug: "/case-study/synergies4",
    title: "Synergies4 Case Study | Enterprise Solution Development | Antimatter AI",
    meta_description:
      "Synergies4 case study - building scalable enterprise solutions with modern technology. Discover how we delivered a comprehensive enterprise platform.",
    meta_keywords: "Synergies4, enterprise solutions, case study, scalable software, enterprise platform",
    canonical_url: "https://www.antimatterai.com/case-study/synergies4",
    og_title: "Synergies4 Case Study - Enterprise Solution",
    og_description: "Synergies4 case study - building scalable enterprise solutions with modern technology.",
    og_image: "/images/CaseStudies/synergies4.jpg",
    twitter_title: "Synergies4 Case Study - Enterprise Solution",
    twitter_description: "Synergies4 case study - building scalable enterprise solutions with modern technology.",
    twitter_image: "/images/CaseStudies/synergies4.jpg",
    category: "case-study",
    parent_slug: "/work",
  },
  {
    slug: "/case-study/curehire",
    title: "Curehire Case Study | Healthcare Recruitment Platform | Antimatter AI",
    meta_description:
      "Curehire case study - revolutionizing healthcare recruitment with AI-powered matching and automation. See how we built a platform that connects healthcare professionals with opportunities.",
    meta_keywords: "Curehire, healthcare recruitment, case study, AI matching, healthcare jobs platform",
    canonical_url: "https://www.antimatterai.com/case-study/curehire",
    og_title: "Curehire Case Study - Healthcare Recruitment Platform",
    og_description: "Curehire case study - revolutionizing healthcare recruitment with AI-powered matching and automation.",
    og_image: "/images/CaseStudies/curehire.jpg",
    twitter_title: "Curehire Case Study - Healthcare Recruitment Platform",
    twitter_description: "Curehire case study - revolutionizing healthcare recruitment with AI-powered matching and automation.",
    twitter_image: "/images/CaseStudies/curehire.jpg",
    category: "case-study",
    parent_slug: "/work",
  },
  {
    slug: "/case-study/feature",
    title: "Feature Case Study | Product Innovation & Design | Antimatter AI",
    meta_description:
      "Feature case study - delivering innovative product solutions with cutting-edge technology. Learn how we created a standout product experience.",
    meta_keywords: "Feature, product innovation, case study, product design, innovative solutions",
    canonical_url: "https://www.antimatterai.com/case-study/feature",
    og_title: "Feature Case Study - Product Innovation",
    og_description: "Feature case study - delivering innovative product solutions with cutting-edge technology.",
    og_image: "/images/CaseStudies/feature.jpg",
    twitter_title: "Feature Case Study - Product Innovation",
    twitter_description: "Feature case study - delivering innovative product solutions with cutting-edge technology.",
    twitter_image: "/images/CaseStudies/feature.jpg",
    category: "case-study",
    parent_slug: "/work",
  },
  {
    slug: "/case-study/owasp",
    title: "OWASP Security Project Case Study | Enterprise Security | Antimatter AI",
    meta_description:
      "OWASP case study - implementing enterprise-grade security solutions and compliance frameworks. Discover how we built secure, compliant systems.",
    meta_keywords: "OWASP, security, case study, enterprise security, compliance, secure development",
    canonical_url: "https://www.antimatterai.com/case-study/owasp",
    og_title: "OWASP Security Project Case Study",
    og_description: "OWASP case study - implementing enterprise-grade security solutions and compliance frameworks.",
    og_image: "/images/CaseStudies/owasp.jpg",
    twitter_title: "OWASP Security Project Case Study",
    twitter_description: "OWASP case study - implementing enterprise-grade security solutions and compliance frameworks.",
    twitter_image: "/images/CaseStudies/owasp.jpg",
    category: "case-study",
    parent_slug: "/work",
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
    
    // Always update all pages to ensure categories and internal_links are set
    // Remove duplicates by slug to prevent ON CONFLICT errors
    const uniquePagesMap = new Map<string, PageData>();
    for (const page of allPages) {
      if (!uniquePagesMap.has(page.slug)) {
        uniquePagesMap.set(page.slug, page);
      } else {
        console.warn(`Duplicate page slug found: ${page.slug}, skipping duplicate`);
      }
    }
    const pagesToInsert = Array.from(uniquePagesMap.values());
    const existingPagesCount = existingPages.length;
    
    // Generate internal links based on categories and relationships for SERP sitelinks
    const generateInternalLinks = (currentPage: PageData): string[] => {
      const links: string[] = [];
      
      if (currentPage.is_homepage) {
        // Homepage should link to key pages for sitelinks
        links.push("/work", "/company", "/contact");
        // Add top services
        links.push("/design-agency", "/development-agency", "/ai-development");
        // Add solutions
        links.push("/voice-agents", "/emotion-ai");
      } else if (currentPage.category === "services") {
        // Services link to related services and homepage
        links.push("/");
        const servicePages = pagesToInsert.filter(p => p.category === "services" && p.slug !== currentPage.slug);
        // Link to top 3 related services
        links.push(...servicePages.slice(0, 3).map(p => p.slug));
        links.push("/work"); // Link to portfolio
      } else if (currentPage.category === "solutions") {
        // Solutions link to related solutions and homepage
        links.push("/");
        const solutionPages = pagesToInsert.filter(p => p.category === "solutions" && p.slug !== currentPage.slug);
        links.push(...solutionPages.map(p => p.slug));
        links.push("/contact"); // Link to contact for inquiries
      } else if (currentPage.category === "case-study") {
        // Case studies link to work page and other case studies
        links.push("/work");
        const caseStudyPages = pagesToInsert.filter(p => p.category === "case-study" && p.slug !== currentPage.slug);
        // Link to 2-3 related case studies
        links.push(...caseStudyPages.slice(0, 3).map(p => p.slug));
        links.push("/"); // Link to homepage
      } else if (currentPage.slug === "/work") {
        // Work page links to all case studies
        const caseStudyPages = pagesToInsert.filter(p => p.category === "case-study");
        links.push(...caseStudyPages.map(p => p.slug));
        links.push("/", "/company", "/contact");
      } else if (currentPage.slug === "/company") {
        // Company page links to key pages
        links.push("/", "/work", "/contact");
        links.push("/design-agency", "/development-agency");
      } else if (currentPage.slug === "/contact") {
        // Contact page links to key pages
        links.push("/", "/company", "/work");
        links.push("/design-agency", "/development-agency");
      }
      
      return links.filter((link, index) => links.indexOf(link) === index); // Remove duplicates
    };
    
    // Insert all pages using RPC function - bypasses schema cache issues
    const insertedPages: string[] = [];
    const errors: any[] = [];
    const skippedPages: string[] = [];
    const extendedFieldsUpdates: Array<{ id: string; slug: string; category: string | null; parent_slug: string | null; internal_links: string[] | null }> = [];
    
    for (const page of pagesToInsert) {
      const isExisting = existingSlugs.has(page.slug);
      
      // Always update pages to ensure categories and internal_links are set
      // We'll use upsert which will update existing pages
      
      try {
        // Auto-generate internal links based on category and relationships
        const autoInternalLinks = generateInternalLinks(page);
        
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
          p_internal_links: autoInternalLinks.length > 0 ? autoInternalLinks : null,
          p_parent_slug: (page.parent_slug && page.parent_slug.trim()) || null,
        };
        
        // Split into known fields and extended fields to work around PostgREST schema cache
        const knownFields: Record<string, any> = {
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
        
        const extendedFields: Record<string, any> = {
          category: rpcParams.p_category,
          parent_slug: rpcParams.p_parent_slug,
          internal_links: rpcParams.p_internal_links,
        };
        
        // First upsert known fields (always works)
        let insertResult: { id: string } | null = null;
        const { data: resultData, error: insertError } = await supabase
          .schema('public')
          .from("pages")
          .upsert(knownFields, { onConflict: 'slug' })
          .select('id')
          .single();
        
        if (insertError) {
          // If insert fails, try without schema specification as fallback
          const { data: fallbackResult, error: fallbackError } = await supabase
            .from("pages")
            .upsert(knownFields, { onConflict: 'slug' })
            .select('id')
            .single();
          
          if (fallbackError) {
            console.error(`Error inserting/updating page ${page.slug}:`, fallbackError);
            console.error(`Data attempted:`, JSON.stringify(knownFields, null, 2));
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
        
        if (!insertResult || !insertResult.id) {
          console.warn(`No data returned for page ${page.slug} (but no error)`);
          errors.push({ slug: page.slug, error: "No data returned from upsert" });
          continue;
        }
        
        // Track as successful (main fields updated)
        if (isExisting) {
          skippedPages.push(page.slug); // Track as updated
        } else {
          insertedPages.push(page.slug);
        }
        
        // Store extended field updates to apply via raw SQL batch update after all upserts
        extendedFieldsUpdates.push({
          id: insertResult.id,
          slug: page.slug,
          category: rpcParams.p_category,
          parent_slug: rpcParams.p_parent_slug,
          internal_links: rpcParams.p_internal_links,
        });
        
        console.log(`Successfully ${isExisting ? 'updated' : 'inserted'} page: ${page.slug} (ID: ${insertResult.id})`);
      } catch (err: any) {
        console.error(`Error inserting page ${page.slug}:`, err);
        console.error(`Page data attempted:`, JSON.stringify(page, null, 2));
        errors.push({ slug: page.slug, error: err.message || "Unknown error", stack: err.stack });
      }
    }
    
    // Batch update extended fields using PostgREST REST API directly
    // This bypasses the JS client's schema cache by going straight to the API
    if (extendedFieldsUpdates.length > 0) {
      console.log(`\n=== Batch updating ${extendedFieldsUpdates.length} pages with categories and internal links ===`);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbGNtZHBua3pnd3Z3c254bGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY4NjMxMCwiZXhwIjoyMDc0MjYyMzEwfQ.zeVKENE9mXTdUjv51UwTid2GCLPA3cQZj5h8B9mLqHo";
      
      let successCount = 0;
      let failCount = 0;
      
      for (const update of extendedFieldsUpdates) {
        try {
          // Use PostgREST REST API directly - this should work even if JS client cache doesn't
          const response = await fetch(`${supabaseUrl}/rest/v1/pages?id=eq.${update.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              category: update.category,
              parent_slug: update.parent_slug,
              internal_links: update.internal_links,
              updated_at: new Date().toISOString(),
            }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to update ${update.slug}: ${response.status} ${errorText}`);
            failCount++;
          } else {
            console.log(`✓ Updated ${update.slug}: category=${update.category || 'null'}, parent=${update.parent_slug || 'null'}, links=${update.internal_links?.length || 0}`);
            successCount++;
          }
        } catch (sqlErr: any) {
          console.error(`Update exception for ${update.slug}:`, sqlErr.message);
          failCount++;
        }
      }
      
      console.log(`=== Batch update complete: ${successCount} succeeded, ${failCount} failed ===\n`);
    }
    
    if (insertedPages.length === 0 && skippedPages.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update pages. ${errors.length} errors occurred.`,
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
      message += message ? `, updated ${skippedPages.length} existing pages` : `Updated ${skippedPages.length} existing pages`;
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

