import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, FileText, Video, Send, Menu, X, LogOut, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { Link } from './Router';
import { generateContent, GeneratedContent } from '../lib/openai';
import { generateContentFromArticle } from '../lib/articleProcessor';
import { generateContentFromYouTube } from '../lib/youtubeProcessor';
import { fetchTrendingArticles, trendingCategories, TrendingArticle } from '../lib/perplexityService';
import { getCurrentUser, signOut, onAuthStateChange, User, getPrompts, addPrompt, deletePrompt, Prompt } from '../lib/supabase';

type Tab = 'generator' | 'trending' | 'summarizer' | 'video' | 'prompts';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('generator');

  // Clear content when switching tabs
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // Clear all generated content when switching tabs
    setGeneratedContent(null);
    setArticleGeneratedContent(null);
    setVideoGeneratedContent(null);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<'tweet' | 'linkedin' | 'twitter-thread' | 'both'>('both');
  const [selectedTone, setSelectedTone] = useState<'professional' | 'casual' | 'engaging' | 'funny' | 'informative'>('engaging');
  
  // Generated content state - separate for each tab
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [articleGeneratedContent, setArticleGeneratedContent] = useState<GeneratedContent | null>(null);
  const [videoGeneratedContent, setVideoGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  
  // Article processing state
  const [isProcessingArticle, setIsProcessingArticle] = useState(false);
  const [selectedArticleContentType, setSelectedArticleContentType] = useState<'tweet' | 'linkedin' | 'twitter-thread' | 'both'>('both');
  const [selectedArticleTone, setSelectedArticleTone] = useState<'professional' | 'casual' | 'engaging' | 'funny' | 'informative'>('engaging');
  
  // YouTube processing state
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [selectedVideoContentType, setSelectedVideoContentType] = useState<'tweet' | 'linkedin' | 'twitter-thread' | 'both'>('both');
  const [selectedVideoTone, setSelectedVideoTone] = useState<'professional' | 'casual' | 'engaging' | 'funny' | 'informative'>('engaging');
  
  // Trending state
  const [trendingArticles, setTrendingArticles] = useState<TrendingArticle[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  
  // Prompt Library state
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [selectedPromptSocial, setSelectedPromptSocial] = useState<'linkedin' | 'twitter'>('linkedin');
  const [newPrompt, setNewPrompt] = useState('');
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editedPromptText, setEditedPromptText] = useState('');

  // Authentication state management
  useEffect(() => {
    const checkUser = async () => {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load prompts when switching to prompt library tab
  useEffect(() => {
    if (activeTab === 'prompts') {
      loadPrompts(selectedPromptSocial);
    }
  }, [activeTab, selectedPromptSocial]);

  const handleLogout = async () => {
    try {
      await signOut();
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
    return null;
  }

  const tabs = [
    { id: 'generator' as Tab, name: 'AI Generator', icon: Sparkles },
    { id: 'trending' as Tab, name: 'Trending', icon: TrendingUp },
    { id: 'summarizer' as Tab, name: 'AI Summarizer', icon: FileText },
    { id: 'video' as Tab, name: 'Video Summarizer', icon: Video },
    { id: 'prompts' as Tab, name: 'Prompt Library', icon: Sparkles },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setIsSearching(true);
    setGeneratedContent(null);
    
    try {
      const content = await generateContent({
        topic: topic.trim(),
        contentType: selectedContentType,
        tone: selectedTone,
        targetAudience: 'general'
      });
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please check your OpenAI API key and try again.');
    } finally {
      setIsGenerating(false);
      setIsSearching(false);
    }
  };

  const handleArticleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleUrl.trim()) return;
    
    setIsProcessingArticle(true);
    setGeneratedContent(null);
    
    try {
      const result = await generateContentFromArticle(articleUrl.trim(), selectedArticleContentType, selectedArticleTone);
      
      // Convert the result to GeneratedContent format
      const content: GeneratedContent = {
        tweet: result.tweet,
        linkedin: result.linkedin,
        twitterThread: result.twitterThread,
        hashtags: result.hashtags
      };
      
      setArticleGeneratedContent(content);
    } catch (error) {
      console.error('Error processing article:', error);
      const errorMessage = error instanceof Error && error.message.includes('CORS') 
        ? 'CORS error: Unable to access the article directly. This is common with some websites. The AI will generate content based on the URL and domain information instead.'
        : 'Failed to process article. Please check the URL and try again.';
      alert(errorMessage);
    } finally {
      setIsProcessingArticle(false);
    }
  };

  const handleVideoSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    
    setIsProcessingVideo(true);
    setGeneratedContent(null);
    
    try {
      const result = await generateContentFromYouTube(videoUrl.trim(), selectedVideoContentType, selectedVideoTone);
      
      // Convert the result to GeneratedContent format
      const content: GeneratedContent = {
        tweet: result.tweet,
        linkedin: result.linkedin,
        twitterThread: result.twitterThread,
        hashtags: result.hashtags
      };
      
      setVideoGeneratedContent(content);
    } catch (error) {
      console.error('Error processing video:', error);
      alert('Failed to process video. Please check the URL and try again.');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleFetchTrending = async () => {
    const topic = customTopic.trim() || selectedCategory;
    if (!topic) return;

    setIsLoadingTrending(true);
    setTrendingArticles([]);

    try {
      const response = await fetchTrendingArticles(topic);
      setTrendingArticles(response.articles);
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      alert('Failed to fetch trending articles. Please try again.');
    } finally {
      setIsLoadingTrending(false);
    }
  };

  // Prompt Library functions
  const loadPrompts = async (social: 'linkedin' | 'twitter') => {
    setIsLoadingPrompts(true);
    try {
      const { prompts, error } = await getPrompts(social);
      if (error) {
        console.error('Error loading prompts:', error);
        alert('Failed to load prompts. Please try again.');
      } else {
        setPrompts(prompts || []);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      alert('Failed to load prompts. Please try again.');
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || !newPromptTitle.trim()) return;

    setIsAddingPrompt(true);
    try {
      const { prompt, error } = await addPrompt(newPrompt.trim(), selectedPromptSocial, newPromptTitle.trim());
      if (error) {
        console.error('Error adding prompt:', error);
        alert('Failed to add prompt. Please try again.');
      } else {
        setPrompts(prev => [prompt, ...prev]);
        setNewPrompt('');
        setNewPromptTitle('');
        setShowAddPrompt(false);
        setSelectedPromptSocial('linkedin');
      }
    } catch (error) {
      console.error('Error adding prompt:', error);
      alert('Failed to add prompt. Please try again.');
    } finally {
      setIsAddingPrompt(false);
    }
  };

  const handleDeletePrompt = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const { error } = await deletePrompt(id);
      if (error) {
        console.error('Error deleting prompt:', error);
        alert('Failed to delete prompt. Please try again.');
      } else {
        setPrompts(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    }
  };

  const handleGenerateFromPrompt = async (prompt: Prompt) => {
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      // Use the prompt text directly as the topic for content generation
      const content = await generateContent({
        topic: prompt.prompts,
        contentType: prompt.social === 'linkedin' ? 'linkedin' : 'tweet',
        tone: 'engaging',
        targetAudience: 'general'
      });
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content from prompt:', error);
      alert('Failed to generate content. Please check your OpenAI API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setEditedPromptText(prompt.prompts);
  };

  const handleSaveEdit = async () => {
    if (!editingPrompt || !editedPromptText.trim()) return;

    try {
      // Update the prompt in the local state
      setPrompts(prev => prev.map(p => 
        p.id === editingPrompt.id 
          ? { ...p, prompts: editedPromptText.trim() }
          : p
      ));
      
      setEditingPrompt(null);
      setEditedPromptText('');
    } catch (error) {
      console.error('Error updating prompt:', error);
      alert('Failed to update prompt. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
    setEditedPromptText('');
  };

  const handleGenerateFromEditedPrompt = async (prompt: Prompt) => {
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      // Use the edited prompt text if we're editing, otherwise use the original
      const promptText = editingPrompt && editingPrompt.id === prompt.id 
        ? editedPromptText 
        : prompt.prompts;
      
      const content = await generateContent({
        topic: promptText,
        contentType: prompt.social === 'linkedin' ? 'linkedin' : 'tweet',
        tone: 'engaging',
        targetAudience: 'general'
      });
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content from prompt:', error);
      alert('Failed to generate content. Please check your OpenAI API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="text-xl font-bold text-white">ContentGen</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-semibold text-sm">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
                <p className="text-xs text-slate-400">Free Plan</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleTabChange(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {tabs.find((t) => t.id === activeTab)?.name}
            </h1>
            <p className="text-slate-400 text-sm">
              Create amazing content with AI
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'generator' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Content Generator</h2>
                      <p className="text-slate-400 text-sm">Generate engaging posts and tweets</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6">
                  <div>
                    <label htmlFor="topic" className="block text-sm font-semibold text-slate-300 mb-3">
                      What would you like to create content about?
                    </label>
                    <textarea
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      rows={6}
                      placeholder="Enter your topic or idea here... For example: 'Benefits of remote work' or 'Latest AI trends'"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Content Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'tweet', label: 'Tweet', icon: '🐦' },
                        { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
                        { id: 'twitter-thread', label: 'Thread', icon: '🧵' },
                        { id: 'both', label: 'Both', icon: '📱' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedContentType(type.id as any)}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            selectedContentType === type.id
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500 text-white'
                              : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          <div className="text-lg mb-1">{type.icon}</div>
                          <div className="text-sm font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <h3 className="text-white font-semibold mb-1">Selected Type</h3>
                      <p className="text-slate-400 text-sm">
                        {selectedContentType === 'tweet' && 'Single Tweet'}
                        {selectedContentType === 'linkedin' && 'LinkedIn Post'}
                        {selectedContentType === 'twitter-thread' && 'Twitter Thread'}
                        {selectedContentType === 'both' && 'Tweet + LinkedIn'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <h3 className="text-white font-semibold mb-1">Tone</h3>
                      <select
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value as any)}
                        className="w-full mt-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="engaging">Engaging</option>
                        <option value="funny">Funny</option>
                        <option value="informative">Informative</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full group px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Searching web...
                      </>
                    ) : isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Content
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Generated Content Display */}
                {generatedContent && (
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 font-semibold">Content Generated Successfully!</span>
                    </div>

                    {generatedContent.tweet && (
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">T</span>
                            Tweet
                          </h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.tweet!, 'tweet')}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedItem === 'tweet' ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{generatedContent.tweet}</p>
                      </div>
                    )}

                    {generatedContent.linkedin && (
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">L</span>
                            LinkedIn Post
                          </h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.linkedin!, 'linkedin')}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedItem === 'linkedin' ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{generatedContent.linkedin}</p>
                      </div>
                    )}

                    {generatedContent.twitterThread && generatedContent.twitterThread.length > 0 && (
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">🧵</span>
                            Twitter Thread ({generatedContent.twitterThread.length} tweets)
                          </h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.twitterThread!.join('\n\n'), 'thread')}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedItem === 'thread' ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy All
                              </>
                            )}
                          </button>
                        </div>
                        <div className="space-y-3">
                          {generatedContent.twitterThread.map((tweet, index) => (
                            <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                              <div className="flex items-start justify-between">
                                <p className="text-slate-300 leading-relaxed flex-1">{tweet}</p>
                                <button
                                  onClick={() => copyToClipboard(tweet, `thread-${index}`)}
                                  className="ml-2 flex items-center gap-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-slate-300 hover:text-white transition-colors"
                                >
                                  {copiedItem === `thread-${index}` ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                      <div className="bg-slate-800/30 rounded-lg border border-slate-700 p-4">
                        <h3 className="text-white font-semibold mb-2">Suggested Hashtags</h3>
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.hashtags.map((hashtag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-sm"
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-slate-300">
                    <span className="text-blue-400 font-semibold">💡 Tip:</span> Be specific with your topic for better results. Include target audience, tone, or key points you want to cover.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Trending Topics</h2>
                    <p className="text-slate-400 text-sm">Discover the latest trending articles and news</p>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Choose a Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {trendingCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500 text-white'
                            : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        <div className="text-lg mb-1">{category.icon}</div>
                        <div className="text-sm font-medium">{category.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Topic Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Or enter a custom topic
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g., cryptocurrency, climate change, space exploration..."
                      className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleFetchTrending}
                      disabled={isLoadingTrending || (!selectedCategory && !customTopic.trim())}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoadingTrending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          Get Trending
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Trending Articles Display */}
                {trendingArticles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 font-semibold">
                        Found {trendingArticles.length} trending articles
                      </span>
                    </div>

                    <div className="grid gap-4">
                      {trendingArticles.map((article, index) => (
                        <div key={index} className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-white font-semibold text-lg leading-tight flex-1">
                              {article.title}
                            </h3>
                            <button
                              onClick={() => copyToClipboard(article.url, `article-${index}`)}
                              className="ml-3 flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                            >
                              {copiedItem === `article-${index}` ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy Link
                                </>
                              )}
                            </button>
                          </div>
                          
                          <p className="text-slate-300 leading-relaxed mb-3">
                            {article.summary}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-slate-400">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {article.source}
                              </span>
                              <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                            </div>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <LinkIcon className="w-4 h-4" />
                              Read Article
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trendingArticles.length === 0 && !isLoadingTrending && (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">No articles yet</h3>
                    <p className="text-slate-500">Select a category or enter a custom topic to discover trending articles</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'summarizer' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Article Summarizer</h2>
                      <p className="text-slate-400 text-sm">Generate LinkedIn posts and tweets from articles</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleArticleSummarize} className="space-y-6">
                  <div>
                    <label htmlFor="articleUrl" className="block text-sm font-semibold text-slate-300 mb-3">
                      Article URL
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        id="articleUrl"
                        type="url"
                        value={articleUrl}
                        onChange={(e) => setArticleUrl(e.target.value)}
                        placeholder="https://example.com/article"
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Content Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'tweet', label: 'Tweet', icon: '🐦' },
                        { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
                        { id: 'twitter-thread', label: 'Thread', icon: '🧵' },
                        { id: 'both', label: 'Both', icon: '📱' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedArticleContentType(type.id as any)}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            selectedArticleContentType === type.id
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500 text-white'
                              : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          <div className="text-lg mb-1">{type.icon}</div>
                          <div className="text-sm font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <h3 className="text-white font-semibold mb-1">Selected Type</h3>
                      <p className="text-slate-400 text-sm">
                        {selectedArticleContentType === 'tweet' && 'Single Tweet'}
                        {selectedArticleContentType === 'linkedin' && 'LinkedIn Post'}
                        {selectedArticleContentType === 'twitter-thread' && 'Twitter Thread'}
                        {selectedArticleContentType === 'both' && 'Tweet + LinkedIn'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <h3 className="text-white font-semibold mb-1">Tone</h3>
                      <select
                        value={selectedArticleTone}
                        onChange={(e) => setSelectedArticleTone(e.target.value as any)}
                        className="w-full mt-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="engaging">Engaging</option>
                        <option value="funny">Funny</option>
                        <option value="informative">Informative</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingArticle}
                    className="w-full group px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isProcessingArticle ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing Article...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Summarize & Generate
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Generated Content Display for Article Summarizer */}
                {articleGeneratedContent && activeTab === 'summarizer' && (
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 font-semibold">Article processed successfully!</span>
                    </div>

                    {articleGeneratedContent.tweet && (
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">T</span>
                            Tweet
                          </h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.tweet!, 'tweet')}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedItem === 'tweet' ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{generatedContent.tweet}</p>
                      </div>
                    )}

                    {generatedContent.linkedin && (
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">L</span>
                            LinkedIn Post
                          </h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.linkedin!, 'linkedin')}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedItem === 'linkedin' ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{generatedContent.linkedin}</p>
                      </div>
                    )}

                    {generatedContent.twitterThread && generatedContent.twitterThread.length > 0 && (
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">🧵</span>
                            Twitter Thread ({generatedContent.twitterThread.length} tweets)
                          </h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.twitterThread!.join('\n\n'), 'thread')}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedItem === 'thread' ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy All
                              </>
                            )}
                          </button>
                        </div>
                        <div className="space-y-3">
                          {generatedContent.twitterThread.map((tweet, index) => (
                            <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                              <div className="flex items-start justify-between">
                                <p className="text-slate-300 leading-relaxed flex-1">{tweet}</p>
                                <button
                                  onClick={() => copyToClipboard(tweet, `thread-${index}`)}
                                  className="ml-2 flex items-center gap-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-slate-300 hover:text-white transition-colors"
                                >
                                  {copiedItem === `thread-${index}` ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                      <div className="bg-slate-800/30 rounded-lg border border-slate-700 p-4">
                        <h3 className="text-white font-semibold mb-2">Suggested Hashtags</h3>
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.hashtags.map((hashtag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-sm"
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-slate-300">
                    <span className="text-blue-400 font-semibold">💡 Tip:</span> Works with most blog posts, news articles, and online content. If you encounter CORS errors, the AI will still generate content based on the URL and domain information.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">YouTube Video Summarizer</h2>
                      <p className="text-slate-400 text-sm">Generate LinkedIn posts and tweets from videos</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVideoSummarize} className="space-y-6">
                  <div>
                    <label htmlFor="videoUrl" className="block text-sm font-semibold text-slate-300 mb-3">
                      YouTube Video URL
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        id="videoUrl"
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Content Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'tweet', label: 'Tweet', icon: '🐦' },
                        { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
                        { id: 'twitter-thread', label: 'Thread', icon: '🧵' },
                        { id: 'both', label: 'Both', icon: '📱' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedVideoContentType(type.id as any)}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            selectedVideoContentType === type.id
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-500 text-white'
                              : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          <div className="text-lg mb-1">{type.icon}</div>
                          <div className="text-sm font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <h3 className="text-white font-semibold mb-1">Selected Type</h3>
                      <p className="text-slate-400 text-sm">
                        {selectedVideoContentType === 'tweet' && 'Single Tweet'}
                        {selectedVideoContentType === 'linkedin' && 'LinkedIn Post'}
                        {selectedVideoContentType === 'twitter-thread' && 'Twitter Thread'}
                        {selectedVideoContentType === 'both' && 'Tweet + LinkedIn'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <h3 className="text-white font-semibold mb-1">Tone</h3>
                      <select
                        value={selectedVideoTone}
                        onChange={(e) => setSelectedVideoTone(e.target.value as any)}
                        className="w-full mt-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="engaging">Engaging</option>
                        <option value="funny">Funny</option>
                        <option value="informative">Informative</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingVideo}
                    className="w-full group px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isProcessingVideo ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing Video...
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5" />
                        Summarize & Generate
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Generated Content Display for YouTube Video */}
                {videoGeneratedContent && activeTab === 'video' && (
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 font-semibold">Video processed successfully!</span>
                    </div>

                    {generatedContent.tweet && (
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">T</span>
                            Tweet
                          </h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.tweet!, 'tweet')}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedItem === 'tweet' ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{generatedContent.tweet}</p>
                      </div>
                    )}

                    {generatedContent.linkedin && (
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">L</span>
                            LinkedIn Post
                          </h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.linkedin!, 'linkedin')}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedItem === 'linkedin' ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{generatedContent.linkedin}</p>
                      </div>
                    )}

                    {generatedContent.twitterThread && generatedContent.twitterThread.length > 0 && (
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">🧵</span>
                            Twitter Thread ({generatedContent.twitterThread.length} tweets)
                          </h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.twitterThread!.join('\n\n'), 'thread')}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedItem === 'thread' ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy All
                              </>
                            )}
                          </button>
                        </div>
                        <div className="space-y-3">
                          {generatedContent.twitterThread.map((tweet, index) => (
                            <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                              <div className="flex items-start justify-between">
                                <p className="text-slate-300 leading-relaxed flex-1">{tweet}</p>
                                <button
                                  onClick={() => copyToClipboard(tweet, `thread-${index}`)}
                                  className="ml-2 flex items-center gap-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-slate-300 hover:text-white transition-colors"
                                >
                                  {copiedItem === `thread-${index}` ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                      <div className="bg-slate-800/30 rounded-lg border border-slate-700 p-4">
                        <h3 className="text-white font-semibold mb-2">Suggested Hashtags</h3>
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.hashtags.map((hashtag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-sm"
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                 <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                   <p className="text-sm text-slate-300">
                     <span className="text-blue-400 font-semibold">💡 Tip:</span> Works with any YouTube video. The AI will analyze the transcript and create compelling social media content highlighting key takeaways.
                   </p>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'prompts' && (
             <div className="max-w-6xl mx-auto">
               <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                     <Sparkles className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-white">Prompt Library</h2>
                     <p className="text-slate-400 text-sm">Create and manage your custom prompts</p>
                   </div>
                 </div>

                 {/* Social Platform Toggle */}
                 <div className="mb-6">
                   <div className="flex items-center gap-4 mb-4">
                     <button
                       onClick={() => setSelectedPromptSocial('linkedin')}
                       className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                         selectedPromptSocial === 'linkedin'
                           ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                           : 'bg-slate-800 text-slate-400 hover:text-white'
                       }`}
                     >
                       LinkedIn
                     </button>
                     <button
                       onClick={() => setSelectedPromptSocial('twitter')}
                       className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                         selectedPromptSocial === 'twitter'
                           ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                           : 'bg-slate-800 text-slate-400 hover:text-white'
                       }`}
                     >
                       Twitter
                     </button>
                   </div>
                 </div>

                 {/* Add Prompt Button */}
                 <div className="mb-6">
                   <button
                     onClick={() => setShowAddPrompt(!showAddPrompt)}
                     className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                   >
                     <span>+</span>
                     Add Prompt
                   </button>
                 </div>

                 {/* Add Prompt Form */}
                 {showAddPrompt && (
                   <div className="mb-6 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                     <h3 className="text-white font-semibold mb-4">Add New Prompt</h3>
                     <form onSubmit={handleAddPrompt} className="space-y-4">
                       <div>
                         <label className="block text-sm font-semibold text-slate-300 mb-2">
                           Platform
                         </label>
                         <select
                           value={selectedPromptSocial}
                           onChange={(e) => setSelectedPromptSocial(e.target.value as 'linkedin' | 'twitter')}
                           className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         >
                           <option value="linkedin">LinkedIn</option>
                           <option value="twitter">Twitter</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-slate-300 mb-2">
                           Title
                         </label>
                         <input
                           type="text"
                           value={newPromptTitle}
                           onChange={(e) => setNewPromptTitle(e.target.value)}
                           placeholder="Enter a title for your prompt..."
                           className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           required
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-semibold text-slate-300 mb-2">
                           Prompt Template
                         </label>
                         <textarea
                           value={newPrompt}
                           onChange={(e) => setNewPrompt(e.target.value)}
                           rows={4}
                           placeholder="Enter your prompt template. Use [TOPIC] as a placeholder for the topic..."
                           className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                           required
                         />
                         <p className="text-xs text-slate-400 mt-1">
                           Use [TOPIC] as a placeholder for the topic
                         </p>
                       </div>
                       <div className="flex gap-3">
                         <button
                           type="submit"
                           disabled={isAddingPrompt}
                           className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
                         >
                           {isAddingPrompt ? (
                             <>
                               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                               Adding...
                             </>
                           ) : (
                             'Add Prompt'
                           )}
                         </button>
                         <button
                           type="button"
                           onClick={() => {
                             setShowAddPrompt(false);
                             setNewPrompt('');
                             setNewPromptTitle('');
                             setSelectedPromptSocial('linkedin');
                           }}
                           className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                         >
                           Cancel
                         </button>
                       </div>
                     </form>
                   </div>
                 )}

                 {/* Prompts List */}
                 {isLoadingPrompts ? (
                   <div className="text-center py-12">
                     <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                     <p className="text-slate-400">Loading prompts...</p>
                   </div>
                 ) : prompts.length > 0 ? (
                   <div className="space-y-4">
                     {prompts.map((prompt) => (
                       <div key={prompt.id} className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                         <div className="mb-3">
                           <h4 className="text-white font-semibold text-lg mb-2">{prompt.title}</h4>
                           <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                             <span className="flex items-center gap-1">
                               <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                               {prompt.social === 'linkedin' ? 'LinkedIn' : 'Twitter'}
                             </span>
                             <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
                           </div>
                           
                           {/* Editable Prompt Text */}
                           {editingPrompt && editingPrompt.id === prompt.id ? (
                             <div className="space-y-3">
                               <textarea
                                 value={editedPromptText}
                                 onChange={(e) => setEditedPromptText(e.target.value)}
                                 rows={6}
                                 className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                 placeholder="Edit your prompt template..."
                               />
                               <div className="flex gap-3">
                                 <button
                                   onClick={handleSaveEdit}
                                   className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                                 >
                                   Save
                                 </button>
                                 <button
                                   onClick={handleCancelEdit}
                                   className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                                 >
                                   Cancel
                                 </button>
                               </div>
                             </div>
                           ) : (
                             <div className="space-y-3">
                               <div 
                                 className="text-slate-300 leading-relaxed p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700/70 transition-colors"
                                 onClick={() => handleEditPrompt(prompt)}
                               >
                                 {prompt.prompts}
                               </div>
                               <button
                                 onClick={() => handleEditPrompt(prompt)}
                                 className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md text-sm hover:bg-blue-500/30 transition-colors"
                               >
                                 Edit Prompt
                               </button>
                             </div>
                           )}
                         </div>
                         
                         {/* Generate Content from Prompt */}
                         <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                           <div className="flex justify-center">
                             <button
                               onClick={() => handleGenerateFromEditedPrompt(prompt)}
                               disabled={isGenerating}
                               className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
                             >
                               {isGenerating ? (
                                 <>
                                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                   Generating...
                                 </>
                               ) : (
                                 <>
                                   <Sparkles className="w-4 h-4" />
                                   Generate Content
                                 </>
                               )}
                             </button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-12">
                     <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                     <h3 className="text-xl font-semibold text-slate-400 mb-2">No prompts yet</h3>
                     <p className="text-slate-500">Add your first prompt to get started</p>
                   </div>
                 )}

                 {/* Generated Content Display */}
                 {generatedContent && (
                   <div className="mt-8 space-y-6">
                     <div className="flex items-center gap-2 mb-4">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                       <span className="text-green-400 font-semibold">Content Generated Successfully!</span>
                     </div>

                     {generatedContent.tweet && (
                       <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                         <div className="flex items-center justify-between mb-3">
                           <h3 className="text-white font-semibold flex items-center gap-2">
                             <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">T</span>
                             Tweet
                           </h3>
                           <button
                             onClick={() => copyToClipboard(generatedContent.tweet!, 'tweet')}
                             className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                           >
                             {copiedItem === 'tweet' ? (
                               <>
                                 <Check className="w-4 h-4" />
                                 Copied!
                               </>
                             ) : (
                               <>
                                 <Copy className="w-4 h-4" />
                                 Copy
                               </>
                             )}
                           </button>
                         </div>
                         <p className="text-slate-300 leading-relaxed">{generatedContent.tweet}</p>
                       </div>
                     )}

                     {generatedContent.linkedin && (
                       <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                         <div className="flex items-center justify-between mb-3">
                           <h3 className="text-white font-semibold flex items-center gap-2">
                             <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">L</span>
                             LinkedIn Post
                           </h3>
                           <button
                             onClick={() => copyToClipboard(generatedContent.linkedin!, 'linkedin')}
                             className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm text-slate-300 hover:text-white transition-colors"
                           >
                             {copiedItem === 'linkedin' ? (
                               <>
                                 <Check className="w-4 h-4" />
                                 Copied!
                               </>
                             ) : (
                               <>
                                 <Copy className="w-4 h-4" />
                                 Copy
                               </>
                             )}
                           </button>
                         </div>
                         <p className="text-slate-300 leading-relaxed">{generatedContent.linkedin}</p>
                       </div>
                     )}

                     {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                       <div className="bg-slate-800/30 rounded-lg border border-slate-700 p-4">
                         <h3 className="text-white font-semibold mb-2">Suggested Hashtags</h3>
                         <div className="flex flex-wrap gap-2">
                           {generatedContent.hashtags.map((hashtag, index) => (
                             <span
                               key={index}
                               className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-sm"
                             >
                               {hashtag}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 )}

                 <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                   <p className="text-sm text-slate-300">
                     <span className="text-blue-400 font-semibold">💡 Tip:</span> Create reusable prompt templates with [TOPIC] placeholders. This allows you to quickly generate content for different topics using the same structure.
                   </p>
                 </div>
               </div>
             </div>
           )}
         </main>
       </div>
     </div>
   );
 }
