import { Star, Quote } from 'lucide-react';

export default function SocialProof() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Marketing Director',
      company: 'TechStart Inc',
      content: 'This tool has transformed our social media strategy. We\'re creating 10x more content in half the time, and engagement is up 150%.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Content Creator',
      company: '250K Followers',
      content: 'As someone who posts daily, this is a game-changer. I can turn my YouTube videos into Twitter threads and LinkedIn posts in seconds.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Founder & CEO',
      company: 'GrowthLabs',
      content: 'The AI understands context incredibly well. It\'s like having a professional copywriter on my team 24/7. Worth every penny.',
      rating: 5
    }
  ];

  return (
    <section className="relative py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Loved By Creators Worldwide
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join thousands of satisfied users growing their social presence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
            >
              <Quote className="w-10 h-10 text-blue-500/20 mb-4" />

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-slate-300 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-slate-400">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-blue-400">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 p-8 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-sm text-slate-400">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-slate-400">5-Star Reviews</div>
            </div>
            <div className="w-px h-12 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">10K+</div>
              <div className="text-sm text-slate-400">Happy Users</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}