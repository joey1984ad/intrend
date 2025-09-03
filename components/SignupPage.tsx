'use client'

import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import GoogleSignInTest from './GoogleSignInTest';
import { useSearchParams } from 'next/navigation';

  const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    company: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [checkoutIntent, setCheckoutIntent] = useState<any>(null);
  
  const searchParams = useSearchParams();
  
  // Check for checkout intent from URL parameters
  useEffect(() => {
    const checkoutParam = searchParams.get('checkout');
    if (checkoutParam) {
      try {
        const decoded = JSON.parse(atob(checkoutParam));
        setCheckoutIntent(decoded);
        console.log('Checkout intent found:', decoded);
      } catch (error) {
        console.error('Failed to decode checkout intent:', error);
      }
    }
  }, [searchParams]);
  
  // Check for OAuth errors from URL parameters
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'google_auth_failed':
          setGoogleError('Google authentication failed. Please try again.');
          break;
        case 'no_auth_code':
          setGoogleError('No authorization code received from Google.');
          break;
        case 'token_exchange_failed':
          setGoogleError('Failed to exchange authorization code. Please try again.');
          break;
        case 'user_info_failed':
          setGoogleError('Failed to get user information from Google.');
          break;
        case 'oauth_error':
          setGoogleError('An error occurred during Google authentication.');
          break;
        default:
          setGoogleError(`Authentication error: ${error}`);
      }
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call for signup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form submitted:', formData);
      
      // If there's a checkout intent, redirect to complete the payment
      if (checkoutIntent) {
        console.log('Redirecting to complete checkout:', checkoutIntent);
        
        // Create checkout session with the user's email
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: checkoutIntent.planId,
            billingCycle: checkoutIntent.billingCycle,
            customerEmail: formData.email,
            successUrl: checkoutIntent.successUrl,
            cancelUrl: checkoutIntent.cancelUrl,
          }),
        });
        
        const data = await response.json();
        
        if (data.success && data.url) {
          window.location.href = data.url;
        } else if (data.success && data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          console.error('Failed to create checkout session:', data.error);
          alert('Account created successfully! Please log in to complete your purchase.');
          window.location.href = '/login';
        }
      } else {
        // No checkout intent, redirect to billing page
        window.location.href = '/billing';
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    
    try {
      // Check if environment variable is set
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.error('Google Client ID not found. Please check your environment variables.');
        alert('Google Sign-In is not configured. Please contact support.');
        setIsGoogleLoading(false);
        return;
      }

      // Redirect to Google OAuth
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/google/callback')}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      console.log('Redirecting to Google OAuth:', googleAuthUrl);
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Google signup error:', error);
      alert('Failed to initiate Google Sign-In. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && 
                     formData.password && formData.agreeToTerms;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {checkoutIntent ? 'Complete Your Purchase' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-blue-200">
            {checkoutIntent 
              ? `Sign up to continue with your ${checkoutIntent.planId} plan selection`
              : 'Start your free trial with Intrend'
            }
          </p>
          {checkoutIntent && (
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-200 text-sm">
                You're signing up for the <strong>{checkoutIntent.planId}</strong> plan ({checkoutIntent.billingCycle} billing)
              </p>
            </div>
          )}
        </div>

        {/* Google Sign In Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Signing in with Google...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </div>
            )}
          </button>

          {googleError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{googleError}</p>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-blue-200">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-white/20 placeholder-blue-300 text-white bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/20 transition-all duration-200"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-white/20 placeholder-blue-300 text-white bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/20 transition-all duration-200"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-white/20 placeholder-blue-300 text-white bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/20 transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
                Company (Optional)
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-white/20 placeholder-blue-300 text-white bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/20 transition-all duration-200"
                placeholder="Your company name"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-white/20 placeholder-blue-300 text-white bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/20 transition-all duration-200"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-blue-300 hover:text-blue-200" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-blue-300 hover:text-blue-200" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                required
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 rounded bg-white/5"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-white">
                I agree to the{' '}
                <a href="#" className="text-blue-300 hover:text-blue-200 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-300 hover:text-blue-200 underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {checkoutIntent ? 'Creating account & redirecting to payment...' : 'Creating account...'}
                </div>
              ) : (
                checkoutIntent ? 'Create Account & Continue to Payment' : 'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-white">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-300 hover:text-blue-200 underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>

        {/* Features Preview */}
        <div className="mt-8 p-6 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">What you'll get:</h3>
          <ul className="space-y-2 text-sm text-white">
            <li className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
              Meta Ads Performance Dashboard
            </li>
            <li className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
              AI Creative Analysis
            </li>
            <li className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
              Multi-Account Management
            </li>
            <li className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
              Creative Gallery & Insights
            </li>
            <li className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
              7-day free trial
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
