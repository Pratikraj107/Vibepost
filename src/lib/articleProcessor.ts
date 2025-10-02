interface ArticleContent {
  title: string;
  content: string;
  url: string;
  author?: string;
  publishDate?: string;
  summary?: string;
}

export async function extractArticleContent(url: string): Promise<ArticleContent> {
  try {
    // Try multiple approaches to handle CORS
    let html = '';
    let success = false;
    
    // Method 1: Try direct fetch (works for some sites)
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (response.ok) {
        html = await response.text();
        success = true;
      }
    } catch (error) {
      console.log('Direct fetch failed, trying CORS proxy...');
    }
    
    // Method 2: Use CORS proxy if direct fetch fails
    if (!success) {
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
          const data = await response.json();
          html = data.contents;
          success = true;
        }
      } catch (error) {
        console.log('AllOrigins proxy failed, trying alternative proxy...');
      }
    }
    
    // Method 3: Try alternative CORS proxy
    if (!success) {
      try {
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        const response = await fetch(proxyUrl, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (response.ok) {
          html = await response.text();
          success = true;
        }
      } catch (error) {
        console.log('CORS-anywhere proxy failed, trying another proxy...');
      }
    }
    
    // Method 4: Try another CORS proxy
    if (!success) {
      try {
        const proxyUrl = `https://thingproxy.freeboard.io/fetch/${url}`;
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
          html = await response.text();
          success = true;
        }
      } catch (error) {
        console.log('ThingProxy failed, using fallback...');
      }
    }
    
    // Method 5: Fallback to manual content extraction
    if (!success) {
      console.log('All CORS methods failed, using fallback approach...');
      return await extractContentFallback(url);
    }
    
    // Extract content from HTML
    const title = extractTitle(html);
    const content = extractMainContent(html);
    
    return {
      title,
      content,
      url,
      author: extractAuthor(html),
      publishDate: extractPublishDate(html)
    };
  } catch (error) {
    console.error('Error extracting article content:', error);
    throw new Error('Failed to extract article content. Please check the URL and try again.');
  }
}

function extractTitle(html: string): string {
  // Try to find title in various meta tags
  const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
  const ogTitleRegex = /<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i;
  const twitterTitleRegex = /<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"[^>]*>/i;
  
  let title = titleRegex.exec(html)?.[1] || 
              ogTitleRegex.exec(html)?.[1] || 
              twitterTitleRegex.exec(html)?.[1] || 
              'Untitled Article';
  
  // Clean up the title
  title = title.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .trim();
  
  return title;
}

function extractMainContent(html: string): string {
  // Simple content extraction - look for common article containers
  const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/i;
  const mainRegex = /<main[^>]*>([\s\S]*?)<\/main>/i;
  const contentRegex = /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
  
  let content = articleRegex.exec(html)?.[1] || 
                mainRegex.exec(html)?.[1] || 
                contentRegex.exec(html)?.[1] || 
                html;
  
  // Remove HTML tags and clean up text
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                   .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                   .replace(/<[^>]+>/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
  
  // Limit content length to avoid token limits
  if (content.length > 4000) {
    content = content.substring(0, 4000) + '...';
  }
  
  return content;
}

function extractAuthor(html: string): string | undefined {
  const authorRegex = /<meta[^>]*name="author"[^>]*content="([^"]*)"[^>]*>/i;
  const ogAuthorRegex = /<meta[^>]*property="article:author"[^>]*content="([^"]*)"[^>]*>/i;
  
  return authorRegex.exec(html)?.[1] || ogAuthorRegex.exec(html)?.[1];
}

function extractPublishDate(html: string): string | undefined {
  const dateRegex = /<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"[^>]*>/i;
  const dateRegex2 = /<meta[^>]*name="date"[^>]*content="([^"]*)"[^>]*>/i;
  
  return dateRegex.exec(html)?.[1] || dateRegex2.exec(html)?.[1];
}

async function extractContentFallback(url: string): Promise<ArticleContent> {
  // Fallback method when CORS blocks all requests
  // This creates a basic article structure from the URL
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  
  // Extract basic info from URL
  const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
  const lastPart = pathParts[pathParts.length - 1] || 'article';
  
  // Create a title from the URL
  const title = lastPart
    .replace(/[-_]/g, ' ')
    .replace(/\.(html|php|asp)$/i, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Create basic content
  const content = `This article from ${domain} discusses ${title.toLowerCase()}. 
  
  To get the full content, please visit the original article at: ${url}
  
  The AI will generate social media content based on the article topic and domain context.`;
  
  return {
    title: title || 'Article from ' + domain,
    content,
    url,
    author: undefined,
    publishDate: new Date().toISOString()
  };
}

export async function generateContentFromArticle(
  articleUrl: string,
  contentType: 'tweet' | 'linkedin' | 'twitter-thread' | 'both' = 'both',
  tone: 'professional' | 'casual' | 'engaging' | 'funny' | 'informative' = 'engaging'
): Promise<{
  tweet?: string;
  linkedin?: string;
  twitterThread?: string[];
  hashtags: string[];
}> {
  try {
    // Extract article content
    const article = await extractArticleContent(articleUrl);
    
    // Generate social media content from the article
    const { generateContent } = await import('./openai');
    
    const result = await generateContent({
      topic: `Article: ${article.title}\n\nContent: ${article.content}`,
      contentType,
      tone,
      targetAudience: 'general'
    });
    
    return {
      tweet: result.tweet,
      linkedin: result.linkedin,
      twitterThread: result.twitterThread,
      hashtags: result.hashtags || []
    };
  } catch (error) {
    console.error('Error generating content from article:', error);
    throw new Error('Failed to process article. Please check the URL and try again.');
  }
}
