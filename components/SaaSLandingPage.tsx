'use client'

import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CogIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  EyeIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  CpuChipIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

const SaaSLandingPage: React.FC = () => {
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Meta Ads Performance Dashboard',
      description: 'Real-time insights into Facebook, Instagram, and Messenger ad performance with comprehensive metrics and visualizations.'
    },
    {
      icon: CpuChipIcon,
      title: 'AI Creative Analysis',
      description: 'AI-powered analysis of your ad creatives with performance predictions and optimization recommendations.'
    },
    {
      icon: UsersIcon,
      title: 'Multi-Account Management',
      description: 'Manage multiple Facebook ad accounts from a single dashboard with unified reporting and insights.'
    },
    {
      icon: EyeIcon,
      title: 'Creative Gallery & Insights',
      description: 'Comprehensive creative asset management with performance tracking across all your campaigns.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Cross-Platform Analytics',
      description: 'Unified analytics for Facebook, Instagram, Messenger, and Audience Network campaigns.'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Campaign Optimization',
      description: 'Data-driven insights and recommendations to improve your Meta Ads performance and ROAS.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'FREE',
      period: '',
      description: 'Perfect for small agencies and businesses',
      features: [
        'Up to 3 ad accounts',
        'Basic performance dashboard',
        'Creative gallery access',
        'Email support',
        '7-day data retention',
        'Basic reporting'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$10',
      period: '/month',
      description: 'Ideal for growing agencies and businesses',
      features: [
        'Up to 10 ad accounts',
        'Advanced analytics & insights',
        'AI creative analysis',
        'Priority support',
        '30-day data retention',
        'Custom reporting',
        'Campaign optimization tips'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$20',
      period: '/month',
      description: 'For large agencies and enterprise clients',
      features: [
        'Unlimited ad accounts',
        'Full API access',
        'White-label solutions',
        'Dedicated account manager',
        '90-day data retention',
        'Custom integrations',
        'Advanced AI insights'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechFlow Agency',
      content: 'Intrend has transformed how we manage our Meta Ads campaigns. The AI creative analysis alone has increased our ROAS by 35%.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Founder',
      company: 'GrowthLab',
      content: 'Finally, a dashboard that gives us real-time insights into all our Facebook and Instagram campaigns. The creative performance tracking is invaluable.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Digital Marketing Manager',
      company: 'BrandBoost',
      content: 'The multi-account management and cross-platform analytics have streamlined our entire Meta Ads workflow. Game changer!',
      rating: 5
    }
  ];

  const stats = [
    { label: 'Ad Accounts Managed', value: '10,000+' },
    { label: 'Creative Assets Analyzed', value: '500,000+' },
    { label: 'Performance Improvement', value: '40% Avg.' },
    { label: 'Customer Satisfaction', value: '98%' }
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email signup logic here
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-indigo-600">Intrend</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Reviews</a>
                <a href="/dashboard" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="/login" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Sign In</a>
                <a href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center mb-6">
              <SparklesIcon className="h-8 w-8 text-indigo-600 mr-2" />
              <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                AI-Powered Meta Ads Analytics
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-black sm:text-6xl">
              Transform Your{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Meta Ads Performance</span>
              <br />
              with AI-Driven Insights
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The ultimate dashboard for digital marketing agencies. Get real-time insights into your Facebook, Instagram, and Messenger campaigns with AI-powered creative analysis and optimization recommendations.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href="/signup" className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors">
                Start Free Trial
              </a>
              <a href="/dashboard" className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <PresentationChartLineIcon className="w-5 h-5" />
                View Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-indigo-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Everything you need to dominate Meta Ads
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Powerful features designed to give you complete control over your Meta Ads campaigns and creative performance.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <dt className="text-lg font-semibold leading-7 text-black">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
                      <feature.icon className="h-7 w-7 text-white" aria-hidden="true" />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* AI Creative Analysis Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              AI-Powered Creative Analysis
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Get instant insights into your ad creatives with our advanced AI analysis engine.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <CpuChipIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Prediction</h3>
              <p className="text-gray-600">AI analyzes your creatives and predicts performance metrics before you launch.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <SparklesIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Optimization Tips</h3>
              <p className="text-gray-600">Get actionable recommendations to improve your creative performance and ROAS.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Insights</h3>
              <p className="text-gray-600">Monitor creative performance in real-time with detailed analytics and trends.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the plan that fits your agency needs. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 gap-x-8 sm:mt-20 lg:max-w-6xl lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 mx-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-indigo-600 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="mb-8">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-medium text-indigo-600">
                      Most Popular
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-x-4 mb-4">
                    <h3 className="text-lg font-semibold leading-8 text-black">{plan.name}</h3>
                  </div>
                  <p className="text-sm leading-6 text-gray-600">{plan.description}</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-black">{plan.price}</span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">{plan.period}</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600">
                          <svg className="h-4 w-4 flex-none text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="/signup"
                  className={`mt-8 rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600'
                      : 'bg-white text-black border border-gray-300 hover:bg-gray-50 focus-visible:outline-gray-600'
                  } transition-colors`}
                >
                  Get started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Trusted by leading agencies
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              See what our customers are saying about Intrend's Meta Ads dashboard.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-3 gap-8 text-sm leading-6 text-black sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <figure key={testimonial.name} className="col-span-2 hidden sm:block sm:col-span-1">
                <blockquote className="text-black">
                  <p>"{testimonial.content}"</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-x-4">
                  <div className="flex items-center gap-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <div key={i} className="flex h-4 w-4 items-center justify-center rounded bg-indigo-600">
                        <svg className="h-3 w-3 fill-white text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your Meta Ads performance?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
              Join thousands of agencies who trust Intrend to optimize their Facebook, Instagram, and Messenger campaigns.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <form onSubmit={handleEmailSubmit} className="flex w-full max-w-md gap-x-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="min-w-0 flex-auto rounded-md border-0 bg-white/10 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6 placeholder:text-indigo-200"
                  required
                />
                <button
                  type="submit"
                  className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                >
                  Get Started
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-6">
                <a href="/dashboard" className="text-gray-400 hover:text-gray-300 text-sm">Dashboard</a>
                <a href="#features" className="text-gray-400 hover:text-gray-300 text-sm">Features</a>
                <a href="#pricing" className="text-gray-400 hover:text-gray-300 text-sm">Pricing</a>
              </div>
              <p className="text-center text-xs leading-5 text-gray-400">
                &copy; 2024 Intrend. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SaaSLandingPage;
