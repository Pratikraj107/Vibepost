import { Briefcase, Video, Newspaper, TrendingUp } from 'lucide-react';

export default function UseCases() {
  const useCases = [
    {
      icon: Briefcase,
      persona: 'Business Owners',
      title: 'Build Your Brand',
      description: 'Establish thought leadership and grow your professional network with consistent, quality content.'
    },
    {
      icon: Video,
      persona: 'Content Creators',
      title: 'Maximize Reach',
      description: 'Repurpose your videos and blogs across platforms to reach wider audiences effortlessly.'
    },
    {
      icon: Newspaper,
      persona: 'Marketers',
      title: 'Scale Campaigns',
      description: 'Create engaging social content at scale without sacrificing quality or burning out your team.'
    },
    {
      icon: TrendingUp,
      persona: 'Consultants',
      title: 'Share Expertise',
      description: 'Turn your knowledge into valuable social posts that attract clients and showcase authority.'
    }
  ];

  return (
    <section className="relative py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Who It's For
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Perfect for anyone who wants to grow their social presence
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <useCase.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-sm text-blue-400 font-semibold mb-2">
                    {useCase.persona}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}