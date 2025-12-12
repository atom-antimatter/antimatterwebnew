import { NextRequest, NextResponse } from 'next/server';

// Mock search results generator
function generateMockResults(query: string) {
  const mockResults = [
    {
      title: `Understanding ${query}: A Comprehensive Guide`,
      url: `https://example.com/guides/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Explore the latest insights and developments in ${query}. This comprehensive guide covers everything you need to know, from fundamentals to advanced applications.`,
      favicon: 'https://via.placeholder.com/20',
    },
    {
      title: `${query} - Latest Research and Trends`,
      url: `https://research.example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Discover cutting-edge research and emerging trends in ${query}. Stay informed with expert analysis and data-driven insights.`,
      favicon: 'https://via.placeholder.com/20',
    },
    {
      title: `How to Master ${query} in 2025`,
      url: `https://learn.example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Learn practical strategies and best practices for ${query}. Expert-led tutorials and real-world examples to accelerate your understanding.`,
      favicon: 'https://via.placeholder.com/20',
    },
  ];

  const mockImages = [
    {
      url: 'https://via.placeholder.com/400x300/696aac/ffffff?text=' + encodeURIComponent(query.substring(0, 20)),
      title: `${query} visualization`,
      source: 'example.com',
    },
    {
      url: 'https://via.placeholder.com/400x300/3e3f7e/ffffff?text=' + encodeURIComponent(query.substring(0, 20)),
      title: `${query} diagram`,
      source: 'research.example.com',
    },
  ];

  const summary = `Based on current research and analysis, ${query} represents a significant area of interest. Key findings suggest multiple approaches and methodologies that can be applied effectively. This technology continues to evolve rapidly, with new developments emerging regularly. Understanding the fundamentals while staying current with latest trends is essential for success in this domain.`;

  return { results: mockResults, images: mockImages, summary };
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // TODO: Integrate Thesys C1 SDK for GenUI
    // TODO: Add Gemini API for web search
    // TODO: Add Exa API for neural search
    // TODO: Implement Server-Sent Events for streaming
    
    // For now, return mock data that demonstrates the UI capabilities
    const { results, images, summary } = generateMockResults(query);

    const response = {
      query,
      summary,
      results,
      images,
      timestamp: new Date().toISOString(),
      provider: 'mock', // Will be 'gemini' or 'exa' when integrated
    };

    // Simulate slight delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(response);
  } catch (error) {
    console.error('[atom/search] API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Atom Search API endpoint (mock data enabled)',
    version: '1.0.0',
    providers: {
      current: 'mock',
      planned: ['thesys-c1', 'gemini', 'exa'],
    },
    features: [
      'Web search results',
      'Image search',
      'AI-generated summaries',
      'Real-time streaming (planned)',
      'GenUI components (planned)',
    ],
  });
}

