import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { resolve } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const samplePosts = [
  {
    title: 'The Future of AI Agents: How Autonomous Systems are Transforming Business',
    slug: 'future-of-ai-agents-autonomous-systems',
    category: 'ai-trends',
    excerpt: 'Explore how AI agents are revolutionizing business operations, from customer service to complex decision-making. Learn about the latest trends in autonomous AI systems.',
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Artificial Intelligence is entering a new era with autonomous agents that can make decisions, learn from experience, and interact naturally with humans. These systems are no longer just tools - they\'re becoming partners in how we work and solve problems.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 1,
                mode: 'normal',
                style: '',
                text: 'The Rise of Autonomous AI',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'heading',
            tag: 'h2',
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'AI agents are evolving from simple chatbots to sophisticated systems that can understand context, make informed decisions, and execute complex workflows. At Antimatter AI, we\'re building these next-generation systems for enterprises.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    metaTitle: 'Future of AI Agents | Antimatter AI',
    metaDescription: 'Discover how autonomous AI systems are transforming business operations. Expert insights on AI agents, machine learning, and intelligent automation.',
    author: 'Antimatter AI Team',
    _status: 'published',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Antimatter AI Launches Voice Agent Platform with Real-Time Emotion Analysis',
    slug: 'voice-agent-platform-emotion-analysis-launch',
    category: 'company-news',
    excerpt: 'We\'re excited to announce our new voice agent platform featuring 53-dimensional emotion tracking and natural conversation capabilities. See how we\'re changing customer interactions.',
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Today marks a major milestone for Antimatter AI. We\'re launching our voice agent platform that combines natural language processing with real-time emotion analysis to create truly empathetic AI interactions.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 1,
                mode: 'normal',
                style: '',
                text: 'What Makes Our Platform Different',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'heading',
            tag: 'h2',
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Unlike traditional voice assistants, our platform uses 53-dimensional emotional space tracking powered by Hume AI to understand not just what users say, but how they feel. This enables more natural, empathetic responses.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    metaTitle: 'Voice Agent Platform Launch | Antimatter AI',
    metaDescription: 'Antimatter AI launches voice agent platform with real-time emotion analysis. Experience the future of empathetic AI customer interactions.',
    author: 'Matt Bravo, CEO',
    _status: 'published',
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Complete Guide to Building Secure AI Applications: Best Practices for 2025',
    slug: 'secure-ai-applications-best-practices-guide',
    category: 'guides-insights',
    excerpt: 'Learn essential security practices for AI applications. From data protection to model safety, this comprehensive guide covers everything you need to build secure AI systems.',
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Security is paramount when building AI applications. This guide walks through the essential practices we use at Antimatter AI to ensure our AI systems are secure, compliant, and trustworthy.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 1,
                mode: 'normal',
                style: '',
                text: '1. Data Protection & Privacy',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'heading',
            tag: 'h2',
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Always encrypt sensitive data at rest and in transit. Use row-level security policies and implement proper access controls. We recommend Supabase for its built-in security features.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 1,
                mode: 'normal',
                style: '',
                text: '2. Model Security',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'heading',
            tag: 'h2',
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Implement prompt injection protection, rate limiting, and content filtering. Monitor AI outputs for sensitive information leakage and maintain audit logs of all AI interactions.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    metaTitle: 'Secure AI Applications Guide 2025 | Antimatter AI',
    metaDescription: 'Complete guide to building secure AI applications. Learn best practices for data protection, model security, and compliance from AI experts.',
    author: 'Antimatter AI Security Team',
    _status: 'published',
    publishedAt: new Date().toISOString(),
  },
]

async function createSampleBlogs() {
  try {
    const payload = await getPayload({ config })

    console.log('Creating sample blog posts...\n')

    for (const post of samplePosts) {
      try {
        const created = await payload.create({
          collection: 'payload-blog-posts',
          data: post as any,
        })
        
        console.log(`✅ Created: "${created.title}"`)
        console.log(`   Slug: ${created.slug}`)
        console.log(`   URL: https://www.antimatterai.com/blog/${created.slug}\n`)
      } catch (error: any) {
        console.error(`❌ Failed to create "${post.title}":`, error.message)
      }
    }

    console.log('\n✨ Sample blogs created successfully!')
    console.log('\nView all blogs at: https://www.antimatterai.com/blog')
    
    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

createSampleBlogs()

