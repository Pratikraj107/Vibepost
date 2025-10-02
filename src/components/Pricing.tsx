import { Check, Sparkles } from 'lucide-react';
import { Link } from '../pages/Router';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for trying out the platform',
      features: [
        '10 posts per month',
        'Basic AI generation',
        'Article to social',
        'Community support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'For serious content creators',
      features: [
        'Unlimited posts',
        'Advanced AI models',
        'Article & YouTube conversion',
        'Priority support',
        'Content scheduling',
        'Analytics dashboard'
      ],
      popular: true
    },
    {
      name: 'Team',
      price: '$49',
      period: '/month',
      description: 'For growing teams',
      features: [
        'Everything in Pro',
        'Up to 5 team members',
        'Brand voice training',
        'Custom templates',
        'API access',
        'Dedicated account manager'
      ],
      popular: false
    }
  ];

  return (
    <section className="relative py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:transform hover:scale-105 ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border-blue-500/50'
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-slate-400 mb-2">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-slate-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/50'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}