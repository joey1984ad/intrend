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
  
  const searchParams = useSearchParams();
  
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form submitted:', formData);
    setIsLoading(false);
    
    // Redirect to dashboard after successful signup
    window.location.href = '/dashboard';
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
         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-md w-full space-y-8">
         {/* Header */}
         <div className="text-center">
                        <Link href="/" className="inline-block">
               <h1 className="text-3xl font-bold text-black">Intrend</h1>
             </Link>
           <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
             Create your account
           </h2>
           <p className="mt-2 text-sm text-gray-600">
             Start your 14-day free trial. No credit card required.
           </p>
         </div>

        {/* Google Signup Button */}
        <div>
                     <button
             onClick={handleGoogleSignup}
             disabled={isGoogleLoading}
             className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isGoogleLoading ? (
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
             ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          {/* Google Error Display */}
          {googleError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {googleError}
            </div>
          )}
        </div>

                 {/* Divider */}
         <div className="relative">
           <div className="absolute inset-0 flex items-center">
             <div className="w-full border-t border-gray-300" />
           </div>
           <div className="relative flex justify-center text-sm">
             <span className="px-2 bg-gradient-to-br from-gray-50 to-white text-gray-500">
               Or continue with email
             </span>
           </div>
         </div>

        {/* Signup Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Fields */}
                         <div className="grid grid-cols-2 gap-4">
               <div>
                 <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                   First name
                 </label>
                 <input
                   id="firstName"
                   name="firstName"
                   type="text"
                   required
                   value={formData.firstName}
                   onChange={handleInputChange}
                   className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                   placeholder="First name"
                 />
               </div>
               <div>
                 <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                   Last name
                 </label>
                 <input
                   id="lastName"
                   name="lastName"
                   type="text"
                   required
                   value={formData.lastName}
                   onChange={handleInputChange}
                   className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                   placeholder="Last name"
                 />
               </div>
             </div>

                         {/* Email Field */}
             <div>
               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                 Work email
               </label>
                                <input
                   id="email"
                   name="email"
                   type="email"
                   autoComplete="email"
                   required
                   value={formData.email}
                   onChange={handleInputChange}
                   className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                   placeholder="you@company.com"
                 />
             </div>

                         {/* Company Field */}
             <div>
               <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                 Company name
               </label>
                                <input
                   id="company"
                   name="company"
                   type="text"
                   value={formData.company}
                   onChange={handleInputChange}
                   className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                   placeholder="Your company"
                 />
             </div>

                         {/* Password Field */}
             <div>
               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                 Password
               </label>
               <div className="mt-1 relative">
                 <input
                   id="password"
                   name="password"
                   type={showPassword ? 'text' : 'password'}
                   autoComplete="new-password"
                   required
                   value={formData.password}
                   onChange={handleInputChange}
                   className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                   placeholder="Create a password"
                 />
                 <button
                   type="button"
                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
                   onClick={() => setShowPassword(!showPassword)}
                 >
                   {showPassword ? (
                     <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                   ) : (
                     <EyeIcon className="h-5 w-5 text-gray-400" />
                   )}
                 </button>
               </div>
               <p className="mt-1 text-xs text-gray-500">
                 Must be at least 8 characters
               </p>
             </div>

                         {/* Terms Checkbox */}
             <div className="flex items-start">
               <div className="flex items-center h-5">
                 <input
                   id="agreeToTerms"
                   name="agreeToTerms"
                   type="checkbox"
                   required
                   checked={formData.agreeToTerms}
                   onChange={handleInputChange}
                   className="focus:ring-black h-4 w-4 text-black border-gray-300 rounded"
                 />
               </div>
               <div className="ml-3 text-sm">
                 <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                   I agree to the{' '}
                   <a href="#" className="text-black hover:text-gray-700">
                     Terms of Service
                   </a>{' '}
                   and{' '}
                   <a href="#" className="text-black hover:text-gray-700">
                     Privacy Policy
                   </a>
                 </label>
               </div>
             </div>
          </div>

                     {/* Submit Button */}
           <div>
             <button
               type="submit"
               disabled={!isFormValid || isLoading}
               className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>

                     {/* Login Link */}
           <div className="text-center">
             <p className="text-sm text-gray-600">
               Already have an account?{' '}
                                <Link href="/login" className="font-medium text-black hover:text-gray-700">
                   Sign in
                 </Link>
             </p>
           </div>
        </form>

                 {/* Google Sign-In Test */}
         <div className="mt-8">
           <GoogleSignInTest />
         </div>

                 {/* Features Preview */}
         <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
           <h3 className="text-lg font-medium text-gray-900 mb-4">What you'll get:</h3>
           <ul className="space-y-3">
             <li className="flex items-start">
               <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
               <span className="text-sm text-gray-600">14-day free trial, no credit card required</span>
             </li>
             <li className="flex items-start">
               <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
               <span className="text-sm text-gray-600">Full access to Meta Ads dashboard</span>
             </li>
             <li className="flex items-start">
               <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
               <span className="text-sm text-gray-600">AI-powered creative analysis</span>
             </li>
             <li className="flex items-start">
               <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
               <span className="text-sm text-gray-600">Multi-account management</span>
             </li>
           </ul>
         </div>
      </div>
    </div>
  );
};

export default SignupPage;
