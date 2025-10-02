import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does the AI generation work?',
      answer: 'Our AI uses advanced language models trained on millions of high-performing social media posts. Simply provide a topic or idea, and it generates engaging, platform-optimized content in seconds.'
    },
    {
      question: 'Can I customize the generated content?',
      answer: 'Absolutely! All generated content is fully editable. You can tweak the tone, length, and style to match your brand voice perfectly before posting.'
    },
    {
      question: 'What types of links can I convert?',
      answer: 'You can convert blog articles, news articles, YouTube videos, and other content into social posts. Just paste the URL and our AI extracts key insights to create engaging posts.'
    },
    {
      question: 'Is there a limit to how many posts I can generate?',
      answer: 'The Free plan includes 10 posts per month. Pro and Team plans offer unlimited post generation, so you can create as much content as you need.'
    },
    {
      question: 'Do you support languages other than English?',
      answer: 'Currently, we focus on English content to ensure the highest quality. We\'re working on adding more languages in future updates.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time. No long-term commitments or hidden fees.'
    }
  ];

  return (
    <section className="relative py-24 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-400">
            Everything you need to know about the platform
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-800/70 transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`px-6 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'
                }`}
              >
                <p className="text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-500/30">
          <h3 className="text-2xl font-bold text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-slate-400 mb-6">
            Our support team is here to help you get started
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}