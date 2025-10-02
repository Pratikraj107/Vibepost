interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  date?: string;
}

interface WebSearchResponse {
  results: SearchResult[];
  searchQuery: string;
  totalResults: number;
}

export async function searchWeb(query: string, numResults: number = 5): Promise<WebSearchResponse> {
  try {
    // For now, we'll use a simple approach with fetch to a search API
    // In production, you might want to use SerpAPI, Google Custom Search, or another service
    
    // This is a placeholder implementation - you'll need to replace with actual search API
    const searchResults = await performWebSearch(query, numResults);
    
    return {
      results: searchResults,
      searchQuery: query,
      totalResults: searchResults.length
    };
  } catch (error) {
    console.error('Web search error:', error);
    return {
      results: [],
      searchQuery: query,
      totalResults: 0
    };
  }
}

async function performWebSearch(query: string, numResults: number): Promise<SearchResult[]> {
  // Try Google Custom Search API first
  const googleApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
  const googleEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
  if (googleApiKey && googleEngineId) {
    try {
      return await searchWithGoogleAPI(query, numResults, googleApiKey, googleEngineId);
    } catch (error) {
      console.warn('Google Search API failed:', error);
    }
  }
  
  // Fallback to mock results if no API keys are configured
  console.warn('No search API keys configured, using mock results');
  return getMockResults(query, numResults);
}


async function searchWithGoogleAPI(query: string, numResults: number, apiKey: string, engineId: string): Promise<SearchResult[]> {
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(query)}&num=${numResults}`
  );
  
  if (!response.ok) {
    throw new Error(`Google Search API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  return data.items?.map((item: any) => ({
    title: item.title || '',
    snippet: item.snippet || '',
    link: item.link || '',
    date: item.pagemap?.metatags?.[0]?.['article:published_time'] || new Date().toISOString()
  })) || [];
}

function getMockResults(query: string, numResults: number): SearchResult[] {
  const mockResults: SearchResult[] = [
    {
      title: `Latest updates on ${query}`,
      snippet: `Recent developments and news about ${query} show significant progress in the field.`,
      link: `https://example.com/${query.replace(/\s+/g, '-').toLowerCase()}`,
      date: new Date().toISOString()
    },
    {
      title: `Understanding ${query}: A comprehensive guide`,
      snippet: `Learn about ${query} with the latest insights and expert opinions.`,
      link: `https://example.com/guide/${query.replace(/\s+/g, '-').toLowerCase()}`,
      date: new Date().toISOString()
    },
    {
      title: `Expert analysis: ${query} trends`,
      snippet: `Industry experts share their insights on current ${query} trends and future outlook.`,
      link: `https://example.com/analysis/${query.replace(/\s+/g, '-').toLowerCase()}`,
      date: new Date().toISOString()
    }
  ];
  
  return mockResults.slice(0, numResults);
}

export function shouldSearchWeb(topic: string): boolean {
  // Determine if web search is needed based on the topic
  const searchKeywords = [
    'news', 'latest', 'recent', 'update', 'trend', 'current', 'today', '2024', '2025',
    'breaking', 'announcement', 'release', 'new', 'recently', 'now', 'currently'
  ];
  
  const topicLower = topic.toLowerCase();
  
  // Check if topic contains time-sensitive keywords
  const hasTimeKeywords = searchKeywords.some(keyword => topicLower.includes(keyword));
  
  // Check if topic is about current events, technology, or trending topics
  const isCurrentEvent = topicLower.includes('ai') || 
                         topicLower.includes('technology') || 
                         topicLower.includes('crypto') || 
                         topicLower.includes('stock') ||
                         topicLower.includes('market') ||
                         topicLower.includes('politics') ||
                         topicLower.includes('economy');
  
  return hasTimeKeywords || isCurrentEvent;
}

export function formatSearchResultsForAI(searchResults: WebSearchResponse): string {
  if (searchResults.results.length === 0) {
    return '';
  }
  
  let formattedResults = `\n\nLatest information from web search:\n`;
  formattedResults += `Search Query: ${searchResults.searchQuery}\n`;
  formattedResults += `Found ${searchResults.totalResults} relevant results:\n\n`;
  
  searchResults.results.forEach((result, index) => {
    formattedResults += `${index + 1}. ${result.title}\n`;
    formattedResults += `   ${result.snippet}\n`;
    if (result.date) {
      formattedResults += `   Date: ${new Date(result.date).toLocaleDateString()}\n`;
    }
    formattedResults += `   Source: ${result.link}\n\n`;
  });
  
  formattedResults += `\nUse this latest information to create current, relevant, and up-to-date content.`;
  
  return formattedResults;
}
