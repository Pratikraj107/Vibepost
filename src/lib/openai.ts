import OpenAI from 'openai';
import { searchWeb, formatSearchResultsForAI } from './webSearch';

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
  webSearch?: boolean;
}

export interface GeneratedContent {
  tweet?: string;
  linkedin?: string;
  twitterThread?: string[];
  hashtags?: string[];
}

export async function generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
  const openai = getOpenAI();
  
  // Always perform web search to get latest information about the topic
  // unless explicitly disabled
  let webSearchResults = '';
  if (request.webSearch !== false) {
    try {
      console.log('🔍 Searching web for latest information about:', request.topic);
      const searchResults = await searchWeb(request.topic, 5); // Increased to 5 results for better context
      
      // Check if mock results were used
      const isUsingMockResults = searchResults.results.some(result => 
        result.link.includes('example.com')
      );
      
      if (isUsingMockResults) {
        console.warn('⚠️ WARNING: Using mock/placeholder search results. Please configure Google Custom Search API keys for real search results.');
        console.warn('   Set VITE_GOOGLE_SEARCH_API_KEY and VITE_GOOGLE_SEARCH_ENGINE_ID in your environment variables.');
      } else {
        console.log('✅ Real web search results obtained:', searchResults.totalResults, 'results');
      }
      
      webSearchResults = formatSearchResultsForAI(searchResults);
      console.log('📊 Web search formatted and ready for AI');
    } catch (error) {
      console.warn('❌ Web search failed, continuing without latest information:', error);
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

  const systemPrompt = `You are an expert social media content creator. Follow the user's instructions exactly as provided.

CRITICAL LENGTH REQUIREMENTS:
- Tweets: MUST be at least 200 characters (can be longer)
- LinkedIn posts: MUST be at least 500 characters (can be longer)
- Twitter threads: Each tweet in the thread should be at least 200 characters
- These are MINIMUM requirements - you can exceed these lengths

ACCURACY AND FACT-CHECKING (CRITICAL):
- ALWAYS use REAL, ACCURATE information from web search results when provided
- NEVER use placeholder URLs like "example.com" or made-up URLs
- ONLY include URLs that are REAL and from the search results
- Use SPECIFIC facts, details, features, dates, and information from search results
- If search results mention specific product features, pricing, release dates, etc., USE THEM
- DO NOT make up generic information - use the ACTUAL details from the search results
- If you don't have real information, use your knowledge base but indicate if information is from your training data

WEB SEARCH INFORMATION PRIORITY:
- Web search results are your PRIMARY source of truth when provided
- Extract and use SPECIFIC details: product names, features, pricing, dates, company names, URLs
- Incorporate exact facts and statistics from the search results
- Reference real URLs, official sources, and accurate information only
- If search results contain warnings about placeholder data, use your knowledge base instead

Always ensure your content meets these character minimums while following the user's specific instructions and using ACCURATE, REAL information from web searches when provided.`;

  const getContentTypeDescription = (type: string) => {
    switch (type) {
      case 'tweet': return 'a single tweet';
      case 'linkedin': return 'a LinkedIn post';
      case 'twitter-thread': return 'a Twitter thread (3-7 connected tweets)';
      case 'both': return 'both a tweet and LinkedIn post';
      default: return `a ${type}`;
    }
  };

  const formatInstructions = request.contentType === 'both' 
    ? '\n\nIMPORTANT: Generate BOTH a tweet and a LinkedIn post. Format your response as follows:\nTweet: [your tweet content here]\nLinkedIn: [your LinkedIn post content here]'
    : request.contentType === 'twitter-thread'
    ? '\n\nIMPORTANT: Generate a Twitter thread with 3-7 connected tweets. Number each tweet (e.g., 1/7, 2/7, etc.).'
    : '';

  const webSearchInstruction = webSearchResults 
    ? `\n\n🔍 CRITICAL WEB SEARCH DATA: I have searched the internet and found the latest information about this topic. 

MANDATORY REQUIREMENTS:
1. Use the SPECIFIC facts, details, and information from the search results below
2. If URLs are provided in search results, use ONLY those REAL URLs - NEVER use placeholder URLs like example.com
3. Include exact product names, features, pricing, dates, or other specific details mentioned in the search results
4. Make your content accurate and factual based on the search results
5. If search results contain warnings about placeholder data, rely on your knowledge base for accurate information

Search Results:
${webSearchResults}`
    : '';

  const userPrompt = `Generate ${getContentTypeDescription(request.contentType)} based on this topic:

${request.topic}

${request.tone ? `Tone: ${request.tone}` : ''}
${request.targetAudience ? `Target audience: ${request.targetAudience}` : ''}${formatInstructions}${webSearchInstruction}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for better instruction following
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent, instruction-following output
      max_tokens: 1500, // Increased token limit for longer, more detailed content
      top_p: 0.9, // Focus on most likely tokens for better quality
      frequency_penalty: 0.1, // Slight penalty to avoid repetition
      presence_penalty: 0.1 // Slight penalty to encourage new content
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
  console.log('Parsing content for type:', contentType);
  console.log('Raw content:', content);
  
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
      // For LinkedIn posts, use the entire content as the LinkedIn post
      result.linkedin = content.trim();
    }
  }
  
  // Validate minimum character requirements
  if (result.tweet && result.tweet.length < 200) {
    console.warn(`Tweet is only ${result.tweet.length} characters, minimum required is 200`);
    // Add more content to meet minimum requirement
    result.tweet = result.tweet + " " + generateAdditionalContent(result.tweet, 'tweet');
  }
  
  if (result.linkedin && result.linkedin.length < 500) {
    console.warn(`LinkedIn post is only ${result.linkedin.length} characters, minimum required is 500`);
    // Add more content to meet minimum requirement
    result.linkedin = result.linkedin + " " + generateAdditionalContent(result.linkedin, 'linkedin');
  }
  
  if (result.twitterThread) {
    result.twitterThread = result.twitterThread.map(tweet => {
      if (tweet.length < 200) {
        console.warn(`Thread tweet is only ${tweet.length} characters, minimum required is 200`);
        return tweet + " " + generateAdditionalContent(tweet, 'tweet');
      }
      return tweet;
    });
  }
  
  // Extract hashtags
  const hashtagRegex = /#\w+/g;
  const hashtags = content.match(hashtagRegex) || [];
  result.hashtags = [...new Set(hashtags)]; // Remove duplicates
  
  console.log('Parsed result:', result);
  return result;
}

function generateAdditionalContent(existingContent: string, type: 'tweet' | 'linkedin'): string {
  // Generate additional content to meet minimum character requirements
  if (type === 'tweet') {
    const additionalContent = [
      "This insight could be a game-changer for your strategy.",
      "What are your thoughts on this approach?",
      "Share your experience in the comments below!",
      "This perspective might surprise you.",
      "Have you tried this method before?",
      "Let's discuss this further!",
      "This could be the breakthrough you've been looking for.",
      "What's your take on this?",
      "I'd love to hear your thoughts!",
      "This is worth exploring further."
    ];
    
    const randomAddition = additionalContent[Math.floor(Math.random() * additionalContent.length)];
    return randomAddition;
  } else if (type === 'linkedin') {
    const additionalContent = [
      "This approach has proven successful for many professionals in the industry. The key is to implement it consistently and measure your results over time. What strategies have worked best for you in similar situations?",
      "I've seen this method transform businesses when applied correctly. The most important factor is understanding your audience and adapting the approach to their specific needs. How do you typically approach similar challenges?",
      "This perspective comes from years of experience in the field. The implementation requires careful planning and execution. What has been your experience with similar strategies?",
      "The results speak for themselves when this method is applied consistently. Success depends on proper execution and continuous improvement. What insights can you share from your own experience?",
      "This framework has helped many professionals achieve their goals. The key is to start with small steps and build momentum over time. What challenges have you faced with similar approaches?"
    ];
    
    const randomAddition = additionalContent[Math.floor(Math.random() * additionalContent.length)];
    return randomAddition;
  }
  
  return "";
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

export async function humanizeContent(content: string, contentType: 'tweet' | 'linkedin' | 'twitter-thread'): Promise<string> {
  const openai = getOpenAI();
  
  const systemPrompt = `You are an expert at making AI-generated content sound more human and natural. Your task is to rewrite the given content to make it sound like it was written by a real person, not an AI.

HUMANIZATION GUIDELINES:
- Use more conversational, natural language
- Add personal touches and human emotions
- Use contractions (I'm, you're, don't, etc.)
- Make it sound like a real person sharing their thoughts
- Remove overly formal or robotic language
- Add personality and authenticity
- Keep the core message but make it more relatable
- Use more natural sentence structures
- Add human-like expressions and reactions

Make the content sound like it was written by a genuine, enthusiastic person who wants to share something valuable with their audience.`;

  const userPrompt = `Rewrite this ${contentType} to make it sound more human and natural:

${content}

Make it sound like a real person wrote this, not an AI. Keep the same core message but make it more conversational and authentic.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7, // Higher temperature for more creative, human-like output
      max_tokens: 1000,
      top_p: 0.9,
      frequency_penalty: 0.2,
      presence_penalty: 0.2
    });

    const humanizedContent = completion.choices[0]?.message?.content;
    if (!humanizedContent) {
      throw new Error('No humanized content generated');
    }

    return humanizedContent.trim();
  } catch (error) {
    console.error('Error humanizing content:', error);
    throw new Error('Failed to humanize content. Please try again.');
  }
}

export interface GTMPlanRequest {
  productName: string;
  productDescription: string;
  targetAudience: string;
  shortTermGoal: string;
  channelsTried?: string;
}

export interface GTMPlan {
  positioning: {
    valueProposition: string;
    taglines: string[];
  };
  channels: Array<{
    platform: string;
    strategy: string;
    why: string;
  }>;
  contentCalendar: Array<{
    day: number;
    content: string;
    platform: string;
    cta: string;
  }>;
  outreachStrategy: {
    dmTemplates: string[];
    collaborationAngles: string[];
    influencerOutreach: string[];
  };
  kpis: Array<{
    metric: string;
    description: string;
    target?: string;
  }>;
}

export async function generateGTMPlan(request: GTMPlanRequest): Promise<GTMPlan> {
  const openai = getOpenAI();
  
  const systemPrompt = `You are an expert Go-To-Market (GTM) strategist specializing in helping solopreneurs and founders launch their products successfully. Your task is to create a comprehensive, actionable GTM plan based on the product information provided.

The plan must be structured and include:
1. Positioning & Messaging: A clear value proposition and compelling taglines
2. GTM Channels: Specific platforms and strategies tailored to the product
3. Content Calendar: Daily/weekly posting ideas with CTAs for at least 7 days
4. Outreach Strategy: DM templates, collaboration ideas, and influencer outreach tactics
5. KPIs to Track: Key metrics that indicate traction and progress

Make the plan specific, actionable, and tailored to the product and target audience.`;

  const userPrompt = `Create a comprehensive Go-To-Market plan for this product:

Product Name: ${request.productName}
Product Description: ${request.productDescription}
Target Audience: ${request.targetAudience}
Short-term Goal: ${request.shortTermGoal}
${request.channelsTried ? `Channels Already Tried: ${request.channelsTried}` : ''}

Please provide a detailed GTM plan in JSON format with the following structure:
{
  "positioning": {
    "valueProposition": "A clear, compelling value proposition that explains what makes this product unique",
    "taglines": ["Tagline 1", "Tagline 2", "Tagline 3"]
  },
  "channels": [
    {
      "platform": "Platform name (e.g., Product Hunt, Twitter, Reddit, LinkedIn, SEO)",
      "strategy": "Specific strategy for this platform",
      "why": "Why this channel is relevant for this product"
    }
  ],
  "contentCalendar": [
    {
      "day": 1,
      "content": "Specific content idea for day 1",
      "platform": "Platform name",
      "cta": "Call-to-action for this content"
    }
  ],
  "outreachStrategy": {
    "dmTemplates": ["DM template 1", "DM template 2", "DM template 3"],
    "collaborationAngles": ["Collaboration idea 1", "Collaboration idea 2"],
    "influencerOutreach": ["Influencer outreach idea 1", "Influencer outreach idea 2"]
  },
  "kpis": [
    {
      "metric": "Metric name",
      "description": "What this metric measures",
      "target": "Target value or range"
    }
  ]
}

IMPORTANT:
- Provide content calendar for at least 7 days (ideally 14-30 days)
- Make all strategies specific to this product and audience
- Include actionable, concrete steps
- Ensure all information is relevant and realistic`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No GTM plan generated');
    }

    // Parse JSON from the response (it might be wrapped in markdown code blocks)
    let jsonContent = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonContent.includes('```json')) {
      jsonContent = jsonContent.split('```json')[1].split('```')[0].trim();
    } else if (jsonContent.includes('```')) {
      jsonContent = jsonContent.split('```')[1].split('```')[0].trim();
    }

    const plan = JSON.parse(jsonContent) as GTMPlan;
    return plan;
  } catch (error) {
    console.error('Error generating GTM plan:', error);
    throw new Error('Failed to generate GTM plan. Please try again.');
  }
}
