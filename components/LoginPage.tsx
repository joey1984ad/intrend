'use client'

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

  const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
    
    // Redirect to dashboard after successful login
    window.location.href = '/dashboard';
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      // Real Google OAuth implementation
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!googleClientId || googleClientId === 'your_google_client_id_here') {
        throw new Error('Google OAuth not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.');
      }
      
      // Build Google OAuth URL
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', googleClientId);
      googleAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/google/callback`);
      googleAuthUrl.searchParams.set('response_type', 'code');
      googleAuthUrl.searchParams.set('scope', 'openid email profile');
      googleAuthUrl.searchParams.set('access_type', 'offline');
      googleAuthUrl.searchParams.set('prompt', 'consent');
      
      console.log('Redirecting to Google OAuth:', googleAuthUrl.toString());
      
      // Redirect to Google OAuth
      window.location.href = googleAuthUrl.toString();
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      setIsGoogleLoading(false);
      // Show error to user
      alert('Google OAuth not configured. Please contact support.');
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className={`min-h-screen transition-colors duration-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 5v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className={`mt-6 text-3xl font-extrabold ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Sign in to your account
          </h2>
          <p className={`mt-2 text-sm ${
            theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
          }`}>
            Welcome back to Intrend
          </p>
        </div>

        {/* Google Sign In Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
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
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
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
                className="appearance-none relative block w-full px-3 py-2 border border-white/20 placeholder-gray-400 text-white bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/10 transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
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
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-white/20 placeholder-gray-400 text-white bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/10 transition-all duration-200"
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/20 rounded bg-white/5"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-blue-200">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300 underline">
                  Forgot your password?
                </a>
              </div>
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
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-blue-200">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-blue-400 hover:text-blue-300 underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-sm text-blue-200 text-center">
            🔒 Your data is protected with enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
