import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '../pages/Router';

export default function CTA() {
  return (
    <section className="relative py-24 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-cyan-900/20 to-teal-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 mb-8">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">Start Your Free Trial Today</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Ready to Transform Your
          <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Social Media Game?
          </span>
        </h2>

        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join thousands of creators, marketers, and businesses using AI to create
          engaging content that drives results.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link href="/signup" className="group px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold text-lg flex items-center gap-2 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-10 py-5 bg-white/5 backdrop-blur-sm text-white rounded-lg font-semibold text-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
            Schedule Demo
          </button>
        </div>

        <p className="text-sm text-slate-400">
          No credit card required • 10 free posts • Cancel anytime
        </p>

        <div className="mt-16 flex flex-wrap justify-center gap-12 items-center opacity-60">
          <div className="text-slate-500">Trusted by leading brands</div>
          <div className="flex gap-8">
            {['TechCorp', 'StartupXYZ', 'MarketPro', 'GrowthCo'].map((company) => (
              <div key={company} className="text-slate-600 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}