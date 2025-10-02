import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from '../pages/Router';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

      {/* Header with Login/Signup buttons */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="max-w-7xl mx-auto flex justify-end">
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm text-white rounded-lg font-medium border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-300">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-500/20 backdrop-blur-sm text-blue-300 rounded-lg font-medium border border-blue-500/30 hover:bg-blue-500/30 hover:border-blue-400 transition-all duration-300">
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">AI-Powered Content Generation</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Transform Ideas Into
          <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Viral Social Content
          </span>
        </h1>

        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          Generate engaging tweets and LinkedIn posts instantly. Turn articles and YouTube videos
          into compelling social media content with the power of AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/signup" className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
            Start Creating Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/10 hover:bg-white/10 transition-all duration-300">
            Watch Demo
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="animate-count-up">
            <div className="text-4xl font-bold text-white mb-1">10K+</div>
            <div className="text-sm text-slate-400">Posts Generated</div>
          </div>
          <div className="animate-count-up delay-100">
            <div className="text-4xl font-bold text-white mb-1">5K+</div>
            <div className="text-sm text-slate-400">Active Users</div>
          </div>
          <div className="animate-count-up delay-200">
            <div className="text-4xl font-bold text-white mb-1">95%</div>
            <div className="text-sm text-slate-400">Satisfaction Rate</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent"></div>
    </section>
  );
}