'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const LandingPageHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);
  const router = useRouter();
  const { isLoggedIn, user } = useUser();

  // Handle scroll effect for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsFeaturesDropdownOpen(false);
        setIsSolutionsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    router.push('/dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleSignInClick = () => {
    router.push('/signup');
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const features = [
    { name: 'Meta Ads Dashboard', href: '#features', description: 'Real-time performance tracking' },
    { name: 'AI Creative Analysis', href: '#ai-analysis', description: 'AI-powered creative insights' },
    { name: 'Multi-Account Management', href: '#features', description: 'Manage all accounts in one place' },
    { name: 'Creative Gallery', href: '#features', description: 'Comprehensive asset management' },
  ];

  const solutions = [
    { name: 'For Agencies', href: '#pricing', description: 'Scale your client campaigns' },
    { name: 'For E-commerce', href: '#pricing', description: 'Boost your online sales' },
    { name: 'For Startups', href: '#pricing', description: 'Grow your business efficiently' },
    { name: 'For Enterprises', href: '#pricing', description: 'Enterprise-grade solutions' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span>Intrend</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Features Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsFeaturesDropdownOpen(!isFeaturesDropdownOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                <span>Features</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isFeaturesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFeaturesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <div className="grid grid-cols-1 gap-1">
                    {features.map((feature) => (
                      <button
                        key={feature.name}
                        onClick={() => scrollToSection(feature.href.replace('#', ''))}
                        className="flex flex-col items-start px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{feature.name}</span>
                        <span className="text-sm text-gray-500">{feature.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsSolutionsDropdownOpen(!isSolutionsDropdownOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                <span>Solutions</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSolutionsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSolutionsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <div className="grid grid-cols-1 gap-1">
                    {solutions.map((solution) => (
                      <button
                        key={solution.name}
                        onClick={() => scrollToSection(solution.href.replace('#', ''))}
                        className="flex flex-col items-start px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{solution.name}</span>
                        <span className="text-sm text-gray-500">{solution.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => scrollToSection('pricing')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Pricing
            </button>

            <button
              onClick={() => scrollToSection('faq')}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              FAQ
            </button>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <span className="text-gray-700 font-medium">
                    Welcome, {user?.name || 'User'}
                  </span>
                  <button
                    onClick={handleDashboardClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignInClick}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* Features Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 px-4">Features</h3>
                <div className="space-y-1">
                  {features.map((feature) => (
                    <button
                      key={feature.name}
                      onClick={() => scrollToSection(feature.href.replace('#', ''))}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-sm text-gray-500">{feature.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Solutions Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 px-4">Solutions</h3>
                <div className="space-y-1">
                  {solutions.map((solution) => (
                    <button
                      key={solution.name}
                      onClick={() => scrollToSection(solution.href.replace('#', ''))}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{solution.name}</div>
                      <div className="text-sm text-gray-500">{solution.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Links */}
              <div className="space-y-1">
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  FAQ
                </button>
              </div>

              {/* Auth Buttons */}
              <div className="pt-4 border-t border-gray-200">
                {isLoggedIn ? (
                  <div className="space-y-2 px-4">
                    <div className="text-sm text-gray-600">
                      Welcome, {user?.name || 'User'}
                    </div>
                    <button
                      onClick={handleDashboardClick}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-4">
                    <button
                      onClick={handleSignInClick}
                      className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => scrollToSection('pricing')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingPageHeader;
