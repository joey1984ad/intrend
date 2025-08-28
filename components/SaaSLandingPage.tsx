'use client'

import React, { useState, useEffect } from 'react';
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
  PresentationChartLineIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  StarIcon,
  ClockIcon,
  BoltIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import PricingSection from './PricingSection';

const SaaSLandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState<boolean[]>(new Array(10).fill(false));
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-section') || '0');
            setIsVisible(prev => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-section]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Meta Ads Performance Dashboard',
      description: 'Real-time insights into Facebook, Instagram, and Messenger ad performance with comprehensive metrics and visualizations.',
      benefit: 'Track performance across all platforms in one place'
    },
    {
      icon: CpuChipIcon,
      title: 'AI Creative Analysis',
      description: 'AI-powered analysis of your ad creatives with performance predictions and optimization recommendations.',
      benefit: 'Increase ROAS by up to 40% with AI insights'
    },
    {
      icon: UsersIcon,
      title: 'Multi-Account Management',
      description: 'Manage multiple Facebook ad accounts from a single dashboard with unified reporting and insights.',
      benefit: 'Save 5+ hours per week on account management'
    },
    {
      icon: EyeIcon,
      title: 'Creative Gallery & Insights',
      description: 'Comprehensive creative asset management with performance tracking across all your campaigns.',
      benefit: 'Optimize creatives based on real performance data'
    },
    {
      icon: GlobeAltIcon,
      title: 'Cross-Platform Analytics',
      description: 'Unified analytics for Facebook, Instagram, Messenger, and Audience Network campaigns.',
      benefit: 'Get complete picture of your advertising ecosystem'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Campaign Optimization',
      description: 'Data-driven insights and recommendations to improve your Meta Ads performance and ROAS.',
      benefit: 'Automated optimization suggestions save time and money'
    }
  ];

  const problems = [
    {
      problem: 'Scattered Data Across Platforms',
      solution: 'Unified Dashboard',
      icon: CogIcon,
      description: 'Stop jumping between Facebook, Instagram, and other platforms'
    },
    {
      problem: 'Poor Creative Performance',
      solution: 'AI-Powered Analysis',
      icon: CpuChipIcon,
      description: 'Let AI identify what makes your best creatives perform'
    },
    {
      problem: 'Time-Consuming Reporting',
      solution: 'Automated Insights',
      icon: ChartBarIcon,
      description: 'Generate comprehensive reports in seconds, not hours'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Connect Your Accounts',
      description: 'Securely connect your Facebook Ad accounts with one-click authentication',
      icon: ShieldCheckIcon,
      time: '2 minutes'
    },
    {
      step: 2,
      title: 'AI Analyzes Your Data',
      description: 'Our AI processes your campaigns and creatives to identify optimization opportunities',
      icon: CpuChipIcon,
      time: 'Instant'
    },
    {
      step: 3,
      title: 'Optimize & Scale',
      description: 'Get actionable insights to improve performance and scale successful campaigns',
      icon: RocketLaunchIcon,
      time: 'Ongoing'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechFlow Agency',
      content: 'Intrend has transformed how we manage our Meta Ads campaigns. The AI creative analysis alone has increased our ROAS by 35%.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Founder',
      company: 'GrowthLab',
      content: 'Finally, a dashboard that gives us real-time insights into all our Facebook and Instagram campaigns. The creative performance tracking is invaluable.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Digital Marketing Manager',
      company: 'BrandBoost',
      content: 'The multi-account management and cross-platform analytics have streamlined our entire Meta Ads workflow. Game changer!',
      rating: 5,
      avatar: 'ER'
    }
  ];

  const stats = [
    { label: 'Ad Accounts Managed', value: '10,000+', icon: UsersIcon, color: 'from-blue-500 to-cyan-500' },
    { label: 'Creative Assets Analyzed', value: '500,000+', icon: EyeIcon, color: 'from-emerald-500 to-teal-500' },
    { label: 'Performance Improvement', value: '40% Avg.', icon: ChartBarIcon, color: 'from-violet-500 to-purple-500' },
    { label: 'Customer Satisfaction', value: '98%', icon: StarIcon, color: 'from-amber-500 to-orange-500' }
  ];

  const faqs = [
    {
      question: 'How quickly can I get started?',
      answer: 'You can be up and running in under 2 minutes. Simply connect your Facebook Ad account and our AI will start analyzing your data immediately.'
    },
    {
      question: 'What if I have multiple ad accounts?',
      answer: 'No problem! Intrend supports unlimited ad accounts. You can manage them all from a single dashboard with unified reporting.'
    },
    {
      question: 'How does the AI creative analysis work?',
      answer: 'Our AI analyzes your creative assets, identifies patterns in high-performing content, and provides specific recommendations to improve your ad performance.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption and never store your Facebook access tokens. Your data is processed securely and never shared with third parties.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or hidden fees.'
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes! Start with our free plan that includes up to 3 ad accounts and basic features. Upgrade anytime to unlock advanced analytics and AI insights.'
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/dashboard';
      return;
    }

    const plan = pricingPlans.find(p => p.id === planId);
    if (!plan) {
      alert('Plan not found. Please try again.');
      return;
    }

    if (plan.price !== 'FREE' && plan.stripePriceId === 'free') {
      alert('This plan is not available for online purchase. Please contact sales for more information.');
      return;
    }

    setSelectedPlan(planId);
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle: billingCycle || 'monthly',
          customerEmail: email,
          successUrl: `${window.location.origin}/dashboard?success=true&plan=${planId}`,
          cancelUrl: `${window.location.origin}?canceled=true`,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
        alert(data.error || 'Failed to start checkout process. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pricingPlans = [
    {
      id: 'free',
      name: 'Free',
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
      popular: false,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID || 'free'
    },
    {
      id: 'startup',
      name: 'Startup',
      price: billingCycle === 'monthly' ? '$10' : '$96',
      period: billingCycle === 'monthly' ? '/month' : '/year',
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
      popular: true,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTUP_PRICE_ID || 'price_startup_monthly'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? '$20' : '$192',
      period: billingCycle === 'monthly' ? '/month' : '/year',
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
      popular: false,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_monthly'
    }
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    alert('Thank you! Your email has been saved. You can now proceed to select a plan.');
    setEmail('');
  };

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
      {/* Hero Section */}
      <section 
        data-section="0"
        className={`relative overflow-hidden py-24 transition-all duration-1000 ${
          isVisible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Animated Background Elements */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Floating Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-full px-6 py-3 mb-8 shadow-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">AI-Powered Meta Ads Management</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Transform Your Meta Ads with AI
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-slate-600 leading-relaxed">
            Unlock 40% better ROAS with AI-powered creative analysis and comprehensive Facebook Ads Library management
          </p>
          
          {/* Social Proof Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/dashboard" 
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
            >
              <BoltIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Start Your Free Trial</span>
            </a>
            <a 
              href="/login" 
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 rounded-xl font-semibold hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-slate-200/50"
            >
              <PlayIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Watch Demo</span>
            </a>
          </div>
        </div>
      </section>

      {/* AI Ad Optimization Mockup Section */}
      <section 
        data-section="1"
        className={`py-24 bg-white/60 backdrop-blur-sm transition-all duration-1000 ${
          isVisible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-purple-50 border border-purple-200 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-700">AI-Powered Optimization</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Watch AI Transform Your Ads in Real-Time
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              See how our AI analyzes your existing ads and generates high-performing variations that drive better results.
            </p>
          </div>
          
          <div className="relative">
            {/* Mockup Dashboard Container */}
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 shadow-2xl overflow-hidden">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">TechFlow Agency</h3>
                    <p className="text-sm text-slate-600">Campaign: Summer Sale 2024</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">Live Optimization</span>
                </div>
              </div>
              
              {/* Campaign Performance Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Original Ad Performance */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">Original Ad</h4>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">CTR:</span>
                      <span className="font-medium text-slate-900">1.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">CPC:</span>
                      <span className="font-medium text-slate-900">$0.85</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">ROAS:</span>
                      <span className="font-medium text-slate-900">2.1x</span>
                    </div>
                  </div>
                </div>
                
                {/* AI Analysis */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">AI Analysis</h4>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span className="text-slate-700">Strong visual hierarchy</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span className="text-slate-700">Clear CTA button</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                      <span className="text-slate-700">Optimize color contrast</span>
                    </div>
                  </div>
                </div>
                
                {/* Predicted Improvement */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">Predicted Results</h4>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">CTR:</span>
                      <span className="font-medium text-emerald-700">+45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">CPC:</span>
                      <span className="font-medium text-emerald-700">-28%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">ROAS:</span>
                      <span className="font-medium text-emerald-700">+67%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI-Generated Variations */}
              <div className="mb-8">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <CpuChipIcon className="w-5 h-5 text-purple-600" />
                  <span>AI-Generated Variations</span>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Variation 1 */}
                  <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 hover:border-blue-300 transition-all duration-300">
                    <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <EyeIcon className="w-8 h-8 text-white" />
                      </div>
                      <h5 className="font-medium text-slate-900 mb-2">Variation A</h5>
                      <p className="text-xs text-slate-600 mb-3">Enhanced contrast + Bold CTA</p>
                      <div className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 rounded-full">
                        <span className="text-xs text-blue-700 font-medium">+52% CTR</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Variation 2 */}
                  <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 hover:border-emerald-300 transition-all duration-300">
                    <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <RocketLaunchIcon className="w-8 h-8 text-white" />
                      </div>
                      <h5 className="font-medium text-slate-900 mb-2">Variation B</h5>
                      <p className="text-xs text-slate-600 mb-3">Dynamic messaging + Social proof</p>
                      <div className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-100 rounded-full">
                        <span className="text-xs text-emerald-700 font-medium">+38% ROAS</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Variation 3 */}
                  <div className="group relative bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-200 hover:border-violet-300 transition-all duration-300">
                    <div className="absolute top-2 right-2 w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <SparklesIcon className="w-8 h-8 text-white" />
                      </div>
                      <h5 className="font-medium text-slate-900 mb-2">Variation C</h5>
                      <p className="text-xs text-slate-600 mb-3">Personalized copy + Urgency</p>
                      <div className="inline-flex items-center space-x-1 px-2 py-1 bg-violet-100 rounded-full">
                        <span className="text-xs text-violet-700 font-medium">+41% Conv.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <CpuChipIcon className="w-4 h-4" />
                  <span>Generate More Variations</span>
                </button>
                <button className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all duration-300">
                  <ChartBarIcon className="w-4 h-4" />
                  <span>View Full Analysis</span>
                </button>
              </div>
            </div>
            
            {/* Floating Success Metrics */}
            <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4 shadow-xl">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Optimization Complete</p>
                <p className="text-xs text-slate-600">3 variations generated</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        data-section="2"
        className={`py-24 bg-white/60 backdrop-blur-sm transition-all duration-1000 ${
          isVisible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-700">Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>
          
          <PricingSection
            onPlanSelect={handlePlanSelection}
            className="text-slate-900"
          />
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section 
        data-section="3"
        className={`py-24 bg-white/60 backdrop-blur-sm transition-all duration-1000 ${
          isVisible[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Pain Points Solved</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Stop Struggling with Scattered Data
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We understand the challenges. Intrend provides intelligent solutions for the most common advertising pain points.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {problems.map((problem, index) => (
              <div 
                key={index} 
                className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 text-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <problem.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-slate-900">{problem.problem}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">{problem.description}</p>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                    <ArrowRightIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">{problem.solution}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section 
        data-section="4"
        className={`py-24 bg-gradient-to-br from-slate-50 to-blue-50 transition-all duration-1000 ${
          isVisible[4] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-700">See It In Action</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Experience the Power of AI
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Watch how Intrend transforms your Meta Ads workflow with intelligent insights and automated optimization.
            </p>
          </div>
          
          <div className="relative">
            {/* Floating UI Elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-2xl blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-emerald-200/30 to-teal-200/30 rounded-2xl blur-xl animate-pulse"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-12 text-center shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                <PlayIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-slate-900">Interactive Product Demo</h3>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                Experience the intuitive interface, real-time analytics, and AI-powered insights that make Intrend the ultimate Meta Ads management platform.
              </p>
              <button className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl">
                <PlayIcon className="w-5 h-5" />
                <span>Launch Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        data-section="5"
        className={`py-24 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all duration-1000 ${
          isVisible[5] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-700">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our streamlined onboarding process gets you up and running with powerful insights in no time.
            </p>
          </div>
          
          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold shadow-xl">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{step.description}</p>
                  <div className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-full">
                    <ClockIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section 
        data-section="6"
        className={`py-24 bg-white/60 backdrop-blur-sm transition-all duration-1000 ${
          isVisible[6] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-indigo-700">Trusted by Industry Leaders</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Join Thousands of Successful Agencies
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              See how Intrend has transformed Meta Ads management for agencies and businesses worldwide.
            </p>
          </div>
          
          {/* Customer Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 opacity-60">
            {['TechFlow', 'GrowthLab', 'BrandBoost', 'AdVantage'].map((company, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-lg font-bold text-slate-700">{company}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="group bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section 
        data-section="7"
        className={`py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-1000 ${
          isVisible[7] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-violet-50 border border-violet-200 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-violet-700">Core Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Powerful tools designed specifically for modern advertising agencies and businesses.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 text-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{feature.description}</p>
                  <div className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-full">
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">{feature.benefit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        data-section="8"
        className={`py-24 bg-white/60 backdrop-blur-sm transition-all duration-1000 ${
          isVisible[8] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-full px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">Common Questions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Everything You Need to Know
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about Intrend's features and pricing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="group bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left text-slate-900 font-semibold flex justify-between items-center group-hover:text-blue-600 transition-colors duration-300"
                >
                  <span className="text-lg">{faq.question}</span>
                  {activeFAQ === index ? (
                    <ChevronUpIcon className="w-6 h-6 text-blue-500" />
                  ) : (
                    <ChevronDownIcon className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
                  )}
                </button>
                {activeFAQ === index && (
                  <p className="text-slate-600 mt-4 leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section 
        data-section="9"
        className={`py-24 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all duration-1000 ${
          isVisible[9] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">Stay Updated</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            Get Started with Your Email
          </h3>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Enter your email to receive updates and get started with your chosen plan
          </p>
          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium transform hover:scale-105"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Final CTA Section */}
      <section 
        data-section="10"
        className={`py-24 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all duration-1000 ${
          isVisible[10] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">Ready to Transform?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Start Your Meta Ads Revolution Today
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Join thousands of agencies and businesses using Intrend to optimize their Meta Ads performance and achieve remarkable results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/signup" 
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
            >
              <RocketLaunchIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Start Your Free Trial</span>
            </a>
            <a 
              href="/login" 
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 rounded-xl font-semibold hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-slate-200/50"
            >
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              <span>Sign In</span>
            </a>
          </div>
        </div>
      </section>

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

