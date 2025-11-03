import { getPayload } from 'payload'
import config from '../payload.config'

// Import static data
import { ServicesData } from '../src/data/services'

// Hardcoded pages data from populate-pages route
const pagesData = [
  {
    slug: '/',
    title: 'Antimatter AI - Building Digital Solutions That Matter',
    category: 'main',
    is_homepage: true,
    seo: {
      metaDescription:
        'Antimatter AI designs and builds high-impact AI products, secure platforms, and modern web experiences. Transform your business with custom AI solutions, product design, and development services.',
      metaKeywords: 'AI development, product design, software development, web development, AI solutions, custom software, digital transformation',
      canonicalUrl: 'https://www.antimatterai.com/',
      ogTitle: 'Antimatter AI — Digital Solutions That Matter',
      ogDescription: 'We empower organizations with AI that turns complex challenges into real-world outcomes.',
      og Image: '/images/HeroOpenGraph.png',
    },
  },
  {
    slug: '/work',
    title: 'Our Work | Portfolio - AI Solutions & Digital Products | Antimatter AI',
    category: 'main',
    seo: {
      metaDescription:
        'Explore our portfolio of AI solutions, web applications, and digital products that drive real results. See case studies from healthcare, enterprise, and security sectors.',
      metaKeywords: 'portfolio, case studies, AI solutions, digital products, web applications, work examples',
      canonicalUrl: 'https://www.antimatterai.com/work',
    },
  },
  {
    slug: '/company',
    title: 'About Us | Our Story & Team | Antimatter AI',
    category: 'main',
    seo: {
      metaDescription:
        'Learn about Antimatter AI - our mission, team, and approach to building innovative digital solutions. Based in Atlanta, GA, serving clients globally.',
      metaKeywords: 'about us, team, mission, company culture, Atlanta, digital solutions',
      canonicalUrl: 'https://www.antimatterai.com/company',
    },
  },
  {
    slug: '/contact',
    title: 'Contact Us | Get Started | Antimatter AI',
    category: 'main',
    seo: {
      metaDescription:
        'Get in touch with Antimatter AI. Let\'s discuss your next project and how we can help bring your vision to life. Contact us at atom@antimatterai.com',
      metaKeywords: 'contact, get in touch, quote, consultation, project inquiry',
      canonicalUrl: 'https://www.antimatterai.com/contact',
    },
  },
  // Services
  {
    slug: '/design-agency',
    title: 'Product Design Services | UI/UX Design Agency | Antimatter AI',
    category: 'services',
    seo: {
      metaDescription:
        'Expert product design services from initial sketches to fully custom apps. Modern design with cutting-edge tools. Transform your ideas into beautiful, user-centered digital experiences.',
      metaKeywords: 'product design, UI design, UX design, app design, web design, design agency, user experience',
      canonicalUrl: 'https://www.antimatterai.com/design-agency',
    },
  },
  {
    slug: '/development-agency',
    title: 'Software Development Services | Custom Development | Antimatter AI',
    category: 'services',
    seo: {
      metaDescription:
        'Professional software development across all platforms. React, Next.js, Node, Flutter, and more. Build scalable, high-performance applications tailored to your needs.',
      metaKeywords: 'software development, web development, app development, React, Next.js, Node.js, Flutter, custom software',
      canonicalUrl: 'https://www.antimatterai.com/development-agency',
    },
  },
  {
    slug: '/ai-development',
    title: 'AI Development Services | LLM & Machine Learning | Antimatter AI',
    category: 'services',
    seo: {
      metaDescription:
        'Advanced AI development with LLM apps, fine-tuning, vision, NLP, and speech pipelines. Build intelligent solutions that transform your business.',
      metaKeywords: 'AI development, LLM, machine learning, NLP, computer vision, speech recognition, AI consulting',
      canonicalUrl: 'https://www.antimatterai.com/ai-development',
    },
  },
]

async function seed() {
  const payload = await getPayload({ config })

  console.log('🌱 Starting seed process...\n')

  try {
    // 1. Create admin user
    console.log('👤 Creating admin user...')
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@antimatterai.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-in-production'

    try {
      await payload.create({
        collection: 'users',
        data: {
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
        },
      })
      console.log(`✅ Admin user created: ${adminEmail}\n`)
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        console.log(`ℹ️  Admin user already exists: ${adminEmail}\n`)
      } else {
        throw error
      }
    }

    // 2. Seed pages
    console.log('📄 Seeding pages...')
    for (const page of pagesData) {
      try {
        await payload.create({
          collection: 'pages',
          data: {
            title: page.title,
            slug: page.slug,
            category: page.category,
            isHomepage: page.is_homepage || false,
            seo: page.seo,
            _status: 'published',
          },
        })
        console.log(`  ✅ Created page: ${page.slug}`)
      } catch (error: any) {
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          console.log(`  ℹ️  Page already exists: ${page.slug}`)
        } else {
          console.error(`  ❌ Error creating page ${page.slug}:`, error.message)
        }
      }
    }
    console.log(`✅ Pages seeded: ${pagesData.length}\n`)

    // 3. Seed services
    console.log('🔧 Seeding services...')
    for (const service of ServicesData) {
      try {
        await payload.create({
          collection: 'services',
          data: {
            title: service.title,
            link: service.link,
            icon: service.icon?.name || '',
            description: service.description || '',
            tagline: service.tagline?.map((line: string) => ({ line })) || [],
            items: service.items?.map((item: any) => ({
              title: item.title,
              images: item.images || [],
            })) || [],
            tools: service.tools?.map((tool: string) => ({ tool })) || [],
            hidden: service.hidden || false,
            customCTA: service.customCTA,
          },
        })
        console.log(`  ✅ Created service: ${service.title}`)
      } catch (error: any) {
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          console.log(`  ℹ️  Service already exists: ${service.title}`)
        } else {
          console.error(`  ❌ Error creating service ${service.title}:`, error.message)
        }
      }
    }
    console.log(`✅ Services seeded: ${ServicesData.length}\n`)

    console.log('🎉 Seed process complete!\n')
    console.log('📋 Summary:')
    console.log(`  - Admin user: ${adminEmail}`)
    console.log(`  - Pages: ${pagesData.length}`)
    console.log(`  - Services: ${ServicesData.length}`)
    console.log('\n🚀 You can now access the admin at: http://localhost:3000/admin')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}\n`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed process failed:', error)
    process.exit(1)
  }
}

seed()

