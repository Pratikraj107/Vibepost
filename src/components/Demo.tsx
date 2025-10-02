import { Twitter, Linkedin } from 'lucide-react';
import { useState } from 'react';

export default function Demo() {
  const [activeTab, setActiveTab] = useState<'tweet' | 'linkedin'>('tweet');

  const examples = {
    tweet: {
      input: 'Article: "The Future of AI in Content Creation"',
      output: 'AI is revolutionizing content creation! 🚀\n\nFrom automated writing to personalized experiences, we\'re witnessing a transformation.\n\nThe future isn\'t about replacing humans—it\'s about amplifying creativity.\n\nWhat\'s your take? Are you leveraging AI in your workflow?'
    },
    linkedin: {
      input: 'YouTube: "10 Productivity Tips for Remote Workers"',
      output: '10 Game-Changing Productivity Tips for Remote Workers 💼\n\nAfter watching an insightful video, here are the key takeaways:\n\n1️⃣ Create a dedicated workspace\n2️⃣ Set clear boundaries\n3️⃣ Use the Pomodoro technique\n4️⃣ Over-communicate with your team\n5️⃣ Take regular breaks\n\nRemote work is here to stay. The question is: How well are you adapting?\n\nWhich tip resonates most with you? Share below! 👇'
    }
  };

  return (
    <section className="relative py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Real examples of AI-generated content
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('tweet')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'tweet'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Twitter className="w-5 h-5" />
              Twitter
            </button>
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'linkedin'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Linkedin className="w-5 h-5" />
              LinkedIn
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50">
              <div className="text-sm text-slate-500 mb-3 font-semibold">INPUT</div>
              <div className="text-slate-300 leading-relaxed">
                {examples[activeTab].input}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-500/30">
              <div className="text-sm text-blue-400 mb-3 font-semibold">AI GENERATED OUTPUT</div>
              <div className="text-white leading-relaxed whitespace-pre-line">
                {examples[activeTab].output}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}