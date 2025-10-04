import OpenAI from 'openai';
import { searchWeb, shouldSearchWeb, formatSearchResultsForAI } from './webSearch';

let openaiInstance: OpenAI | null = null;

export function getOpenAI() {
  if (!openaiInstance) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
    }

    openaiInstance = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, you should use a backend API
    });
  }

  return openaiInstance;
}

export interface ContentGenerationRequest {
  topic: string;
  contentType: 'tweet' | 'linkedin' | 'twitter-thread' | 'both';
  tone?: 'professional' | 'casual' | 'engaging' | 'informative';
  targetAudience?: string;
}

export interface GeneratedContent {
  tweet?: string;
  linkedin?: string;
  twitterThread?: string[];
  hashtags?: string[];
}

export async function generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
  const openai = getOpenAI();
  
  // Check if web search is needed for this topic
  let webSearchResults = '';
  if (shouldSearchWeb(request.topic)) {
    try {
      console.log('Searching web for latest information...');
      const searchResults = await searchWeb(request.topic, 3);
      webSearchResults = formatSearchResultsForAI(searchResults);
      console.log('Web search completed, found', searchResults.totalResults, 'results');
    } catch (error) {
      console.warn('Web search failed, continuing without latest information:', error);
    }
  }
  
  const getToneGuidelines = (tone: string) => {
    switch (tone) {
      case 'professional':
        return 'Use formal language, industry terminology, and authoritative tone. Perfect for business content.';
      case 'casual':
        return 'Use conversational language, contractions, and friendly tone. Great for personal brands.';
      case 'engaging':
        return 'Use compelling language, questions, and calls-to-action. Focus on interaction and engagement.';
      case 'funny':
        return 'Use humor, wit, and light-hearted language. Include jokes and entertaining elements.';
      case 'informative':
        return 'Use educational language, facts, and clear explanations. Focus on teaching and sharing knowledge.';
      default:
        return 'Use engaging language that resonates with your audience.';
    }
  };

  const systemPrompt = `You are an expert social media content creator. Generate engaging, viral-worthy content based on the user's input. 
  
  Guidelines:
  - For tweets: Keep under 280 characters, use engaging language, include relevant hashtags
  - For LinkedIn posts: Professional tone, 3-5 sentences, include call-to-action
  - For Twitter threads: Create 3-7 connected tweets that tell a story or explain a concept, each under 280 characters, numbered (1/7, 2/7, etc.)
  - Make content shareable and engaging
  - Use emojis appropriately
  - Include relevant hashtags (3-5 for tweets, 2-3 for LinkedIn, 1-2 per thread tweet)
  - Ensure content is original and compelling
  - Tone Guidelines: ${getToneGuidelines(request.tone || 'engaging')}
  
  The Winning Structure:
  - Start with a powerful hook (first line): Make a bold, attention-grabbing statement. Promise valuable insight or an unconventional perspective. You have about 1/8 of a second to capture attention.
  - Take a strong stance (main body): Choose one side of an argument and commit fully. Avoid nuance or balanced perspectives. Use confident, authoritative language. Make your point in clear, concise language.
  - Support with specificity (details): Add precise numbers (e.g., "20 hours a week casting spells"). Include relatable examples that create vivid mental images. Use specific scenarios people can visualize.
  - Close with impact (optional follow-up): Consider a double-down tweet that reinforces your position. Add a call to action if relevant. Link to resources when appropriate.`;

  const getContentTypeDescription = (type: string) => {
    switch (type) {
      case 'tweet': return 'a single tweet';
      case 'linkedin': return 'a LinkedIn post';
      case 'twitter-thread': return 'a Twitter thread (3-7 connected tweets)';
      case 'both': return 'both a tweet and LinkedIn post';
      default: return `a ${type}`;
    }
  };

  const userPrompt = `Create ${getContentTypeDescription(request.contentType)} about: "${request.topic}"
  
  ${request.tone ? `Tone: ${request.tone}` : ''}
  ${request.targetAudience ? `Target audience: ${request.targetAudience}` : ''}
  
  ${webSearchResults}
  
  Please provide the content in a structured format.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the generated content
    return parseGeneratedContent(content, request.contentType);
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
}

function parseGeneratedContent(content: string, contentType: string): GeneratedContent {
  const result: GeneratedContent = {};
  
  if (contentType === 'twitter-thread') {
    // Parse Twitter thread - look for numbered tweets
    const threadRegex = /(\d+\/\d+[:\s]*[^\n]+)/g;
    const threadMatches = content.match(threadRegex);
    
    if (threadMatches && threadMatches.length > 0) {
      result.twitterThread = threadMatches.map(tweet => tweet.trim());
    } else {
      // Fallback: split by lines and filter out empty ones
      const lines = content.split('\n').filter(line => line.trim() && line.length > 10);
      result.twitterThread = lines.slice(0, 7); // Max 7 tweets
    }
  } else if (contentType === 'both' || contentType === 'tweet') {
    // Look for tweet content (usually shorter, might have #hashtags)
    const tweetMatch = content.match(/Tweet[:\s]*(.+?)(?=LinkedIn|$)/s);
    if (tweetMatch) {
      result.tweet = tweetMatch[1].trim();
    } else {
      // Fallback: take first paragraph if no clear tweet marker
      const lines = content.split('\n').filter(line => line.trim());
      result.tweet = lines[0]?.trim() || content.substring(0, 280);
    }
  }
  
  if (contentType === 'both' || contentType === 'linkedin') {
    // Look for LinkedIn content
    const linkedinMatch = content.match(/LinkedIn[:\s]*(.+?)$/s);
    if (linkedinMatch) {
      result.linkedin = linkedinMatch[1].trim();
    } else {
      // Fallback: take second paragraph or longer content
      const lines = content.split('\n').filter(line => line.trim());
      result.linkedin = lines[1]?.trim() || content;
    }
  }
  
  // Extract hashtags
  const hashtagRegex = /#\w+/g;
  const hashtags = content.match(hashtagRegex) || [];
  result.hashtags = [...new Set(hashtags)]; // Remove duplicates
  
  return result;
}

export async function generateFromArticle(articleUrl: string): Promise<GeneratedContent> {
  // This would integrate with article scraping service
  // For now, return a placeholder
  throw new Error('Article processing not yet implemented. Please use the topic-based generator.');
}

export async function generateFromYouTube(videoUrl: string): Promise<GeneratedContent> {
  // This would integrate with YouTube API
  // For now, return a placeholder
  throw new Error('YouTube processing not yet implemented. Please use the topic-based generator.');
}
