import { MessageSquare, Sparkles, Share2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: MessageSquare,
      title: 'Input Your Content',
      description: 'Share your idea, paste an article link, or add a YouTube URL'
    },
    {
      icon: Sparkles,
      title: 'AI Works Its Magic',
      description: 'Our advanced AI analyzes and generates engaging social content'
    },
    {
      icon: Share2,
      title: 'Publish & Engage',
      description: 'Copy, customize, and share your content across platforms'
    }
  ];

  return (
    <section className="relative py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple 3-Step Process
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From idea to viral content in seconds
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-400">{index + 1}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {step.title}
                </h3>

                <p className="text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}