# VibeViralBolt Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd VibeviralBolt-main
npm install
```

### 2. Set up Environment Variables

Create a `.env` file in the root directory with your API keys:

```env
# OpenAI Configuration (Required)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (Optional for now)
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: For future article processing
VITE_SCRAPING_BEE_API_KEY=your_scraping_bee_api_key_here

# Optional: For future YouTube processing
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Get Your API Keys

#### OpenAI API Key (Required)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

#### Perplexity API Key (For Trending Section)
1. Go to [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add `VITE_PERPLEXITY_API_KEY=your_key_here` to your `.env` file

#### Web Search API Key (Optional but Recommended)
Choose one of these options for web search functionality:

**Google Custom Search (Recommended)**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Custom Search API
3. Create credentials and get your API key
4. Create a Custom Search Engine at [Google CSE](https://cse.google.com/)
5. Add both keys to your `.env` file:
   ```
   VITE_GOOGLE_SEARCH_API_KEY=your_api_key
   VITE_GOOGLE_SEARCH_ENGINE_ID=your_engine_id
   ```

### 4. Run the Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:5173`

## Features Currently Working

✅ **AI Content Generation**: Generate tweets and LinkedIn posts from topics
✅ **Web Search Integration**: AI searches the web for latest information
✅ **Content Type Selection**: Choose between tweets, LinkedIn posts, and threads
✅ **Tone Selection**: Professional, casual, engaging, funny, or informative
✅ **Article Processing**: Generate content from article URLs with CORS handling
✅ **YouTube Processing**: Generate content from YouTube videos with metadata extraction
✅ **Trending Articles**: Discover latest trending articles using Perplexity AI
✅ **Copy to Clipboard**: Easy copying of generated content
✅ **Beautiful UI**: Modern, responsive design
✅ **Loading States**: Smooth user experience with search indicators

## Features Coming Soon

🔄 **User Authentication**: Sign up and login functionality
🔄 **Content History**: Save and manage generated content

## Troubleshooting

### OpenAI API Key Issues
- Make sure your API key is correct
- Check that you have credits in your OpenAI account
- Ensure the key has the necessary permissions

### Build Issues
- Run `npm install` to ensure all dependencies are installed
- Check that your `.env` file is in the root directory
- Make sure all environment variables are properly set

## Next Steps

1. Test the AI content generation
2. Set up Supabase for user authentication
3. Add article and YouTube processing
4. Deploy to production

Happy coding! 🚀
