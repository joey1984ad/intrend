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
      annualPrice: '$100',
      annualPeriod: '/year',
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
      annualPrice: '$200',
      annualPeriod: '/year',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
            Intrend
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-200">
            AI-Powered Creative Analysis & Facebook Ads Library
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/dashboard" 
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
            >
              Get Started
            </a>
            <a 
              href="/login" 
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 backdrop-blur-sm"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-transparent to-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Powerful Features for Modern Advertising
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Everything you need to manage, analyze, and optimize your Meta Ads campaigns
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-blue-200 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-gradient-to-b from-slate-800/50 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Choose the plan that fits your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white/5 backdrop-blur-sm border rounded-2xl p-8 ${
                  plan.popular 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-indigo-500/10' 
                    : 'border-white/10'
                } hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-blue-200">{plan.period}</span>
                    {plan.annualPrice && (
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-green-400">{plan.annualPrice}</span>
                        <span className="text-green-300 text-sm">{plan.annualPeriod}</span>
                        <div className="text-xs text-green-300 mt-1">Save 17% with annual billing</div>
                      </div>
                    )}
                  </div>
                  <p className="text-blue-200">{plan.description}</p>
                  {plan.annualPrice && (
                    <div className="mt-2 text-center">
                      <span className="inline-block bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30">
                        💰 Save 17% with annual billing
                      </span>
                    </div>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-blue-100">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <a 
                  href="/billing"
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 inline-block text-center ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}>
                  {plan.name === 'Starter' ? 'Get Started Free' : 'Choose Plan'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Advertising?
          </h2>
          <p className="text-xl text-blue-200 mb-8">
            Join thousands of agencies and businesses using Intrend to optimize their Meta Ads performance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/signup" 
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
            >
              Start Your Free Trial
            </a>
            <a 
              href="/login" 
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20 backdrop-blur-sm"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Intrend</span>
              </div>
              <p className="text-blue-200 mb-4 max-w-md">
                AI-powered creative analysis and comprehensive Facebook Ads Library management for modern advertising agencies.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-300 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-blue-300 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-blue-300">
              © 2024 Intrend. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SaaSLandingPage;
