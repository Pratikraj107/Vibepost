interface TrendingArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedDate: string;
  category: string;
}

interface TrendingResponse {
  articles: TrendingArticle[];
  topic: string;
  totalResults: number;
}

export async function fetchTrendingArticles(topic: string): Promise<TrendingResponse> {
  try {
    const perplexityApiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key is not configured. Please add VITE_PERPLEXITY_API_KEY to your environment variables.');
    }

    // Create a search query for trending articles
    const searchQuery = `Find the latest trending articles and news about ${topic} from the past week. Include article titles, summaries, URLs, and publication dates. Focus on the most recent and popular content.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are a news aggregator that finds the latest trending articles. Return a JSON response with an array of articles. Each article should have: title, summary, url, source, publishedDate, and category. Limit to 10 articles maximum.`
          },
          {
            role: 'user',
            content: searchQuery
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    // Parse the JSON response - extract JSON from code blocks if present
    try {
      let jsonContent = content;
      
      // Check if the response contains JSON within code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      const parsedData = JSON.parse(jsonContent);
      
      // Handle both array format and object with articles property
      const articles = Array.isArray(parsedData) ? parsedData : (parsedData.articles || []);
      
      return {
        articles: articles,
        topic,
        totalResults: articles.length
      };
    } catch (parseError) {
      console.warn('Failed to parse Perplexity response, using fallback data:', parseError);
      return createFallbackTrendingData(topic);
    }

  } catch (error) {
    console.error('Error fetching trending articles:', error);
    // Return fallback data if API fails
    return createFallbackTrendingData(topic);
  }
}

function createFallbackTrendingData(topic: string): TrendingResponse {
  const mockArticles: TrendingArticle[] = [
    {
      title: `Latest ${topic} trends and developments`,
      summary: `Recent developments in ${topic} show significant growth and innovation. Key trends include emerging technologies, market shifts, and new opportunities for businesses and individuals.`,
      url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}-trends`,
      source: 'Tech News',
      publishedDate: new Date().toISOString(),
      category: topic
    },
    {
      title: `How ${topic} is changing the industry`,
      summary: `The ${topic} sector is experiencing rapid transformation with new technologies and approaches reshaping traditional business models and creating new opportunities.`,
      url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}-industry-changes`,
      source: 'Industry Report',
      publishedDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      category: topic
    },
    {
      title: `Expert insights on ${topic} future`,
      summary: `Industry experts share their predictions for the future of ${topic}, highlighting key trends, challenges, and opportunities that will shape the sector in the coming years.`,
      url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}-expert-insights`,
      source: 'Expert Analysis',
      publishedDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      category: topic
    },
    {
      title: `${topic} market analysis and predictions`,
      summary: `Comprehensive market analysis reveals strong growth potential in ${topic} with increasing investment and consumer adoption driving market expansion.`,
      url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}-market-analysis`,
      source: 'Market Research',
      publishedDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      category: topic
    },
    {
      title: `Breaking: New ${topic} regulations announced`,
      summary: `Recent regulatory changes in ${topic} are expected to impact businesses and consumers, with new guidelines focusing on innovation and consumer protection.`,
      url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}-regulations`,
      source: 'Government News',
      publishedDate: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      category: topic
    }
  ];

  return {
    articles: mockArticles,
    topic,
    totalResults: mockArticles.length
  };
}

export const trendingCategories = [
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'tech', label: 'Technology', icon: '💻' },
  { id: 'ai', label: 'AI & Machine Learning', icon: '🤖' },
  { id: 'product', label: 'Product', icon: '📦' },
  { id: 'marketing', label: 'Marketing', icon: '📈' },
  { id: 'politics', label: 'Politics', icon: '🏛️' },
  { id: 'movies', label: 'Movies & Entertainment', icon: '🎬' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'health', label: 'Health & Wellness', icon: '🏥' },
  { id: 'science', label: 'Science', icon: '🔬' }
];
