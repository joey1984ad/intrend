'use client'

import React from 'react';

const PricingTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                Intrend
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                Home
              </a>
              <a href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - COMPLETELY EMPTY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Plans & Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Choose the perfect plan for your Meta Ads management needs. All plans include our AI-powered creative analysis and comprehensive dashboard.
          </p>
        </div>

        {/* COMPLETELY EMPTY - NO PRICING COLUMNS */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">NO PRICING COLUMNS</h2>
            <p className="text-slate-600 mb-4">All pricing columns have been completely removed.</p>
            <p className="text-slate-500">No Free plan, no Startup plan, no Pro plan - everything is gone.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingTest;
