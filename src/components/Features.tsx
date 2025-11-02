import { Wand2, FileText, Youtube, Rocket } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Wand2,
      title: 'AI Content Generation',
      description: 'Create original, engaging tweets and LinkedIn posts with just a prompt. Our AI understands your brand voice and generates content that resonates.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FileText,
      title: 'Article to Social',
      description: 'Paste any article link and watch as AI extracts key insights and transforms them into shareable social media content that drives engagement.',
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      icon: Youtube,
      title: 'YouTube to Posts',
      description: 'Turn YouTube videos into compelling social posts. Perfect for content creators, marketers, and anyone looking to repurpose video content.',
      gradient: 'from-teal-500 to-emerald-500'
    },
    {
      icon: Rocket,
      title: 'LaunchPilot - GTM Plans',
      description: 'Build your complete Go-To-Market strategy with AI. Get personalized marketing plans, content calendars, outreach strategies, and KPIs tailored for your product launch.',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section className="relative py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Everything You Need to Market Your Product
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From content creation to complete marketing strategy - all powered by AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 from-blue-500 to-cyan-500"></div>

              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                {feature.title}
              </h3>

              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}