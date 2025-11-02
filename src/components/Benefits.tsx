import { Clock, TrendingUp, Zap, Target, Users, Shield, Rocket, MessageCircle } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      icon: Rocket,
      title: 'Complete GTM Strategy',
      description: 'LaunchPilot generates your entire Go-To-Market plan: positioning, channels, content calendar, outreach, and KPIs. Launch like a pro, even solo.'
    },
    {
      icon: MessageCircle,
      title: 'Join Vibe Club Community',
      description: 'Connect with fellow founders and solopreneurs in Vibe Club. Share experiences, get support, network, and learn from successful entrepreneurs on Discord.'
    },
    {
      icon: Clock,
      title: 'Save Hours Daily',
      description: 'Stop staring at blank screens. Generate quality content in seconds, not hours.'
    },
    {
      icon: TrendingUp,
      title: 'Boost Engagement',
      description: 'AI-optimized content designed to drive likes, shares, and meaningful conversations.'
    },
    {
      icon: Zap,
      title: 'Never Run Out of Ideas',
      description: 'Endless inspiration at your fingertips. Always have fresh content ready to post.'
    },
    {
      icon: Target,
      title: 'Stay On-Brand',
      description: 'Consistent voice and tone across all your social media channels.'
    },
    {
      icon: Users,
      title: 'Multi-Platform Ready',
      description: 'Content optimized for both Twitter and LinkedIn audiences.'
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'Professional-grade content that maintains your credibility and expertise.'
    }
  ];

  return (
    <section className="relative py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Why You'll Love It
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Built for solopreneurs, startup founders, creators, and businesses who want to launch and grow without a marketing team
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300"
            >
              <div className="inline-flex p-3 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300 mb-4">
                <benefit.icon className="w-6 h-6 text-blue-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {benefit.title}
              </h3>

              <p className="text-slate-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}