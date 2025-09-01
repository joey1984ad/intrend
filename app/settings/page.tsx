'use client'

import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Palette, Globe, Database, Key, LogOut, CreditCard } from 'lucide-react';
import { useDashboardTheme } from '@/contexts/DashboardThemeContext';
import EnhancedBillingPage from '@/components/EnhancedBillingPage';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [mounted, setMounted] = useState(false);
  
  // Always call hooks first, then handle theme context safely
  const [theme, setTheme] = useState<'white' | 'dark'>('white');
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Try to get theme context safely after component is mounted
  useEffect(() => {
    if (mounted) {
      try {
        const themeContext = useDashboardTheme();
        if (themeContext?.theme) {
          setTheme(themeContext.theme);
        }
        if (themeContext?.setTheme) {
          // Override the local setTheme with the context one
          setTheme(themeContext.setTheme);
        }
      } catch (error) {
        // If theme context is not available, keep default theme
        console.log('Theme context not available, using default theme');
      }
    }
  }, [mounted]);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    defaultValue="John"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue="Doe"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <input
                    type="text"
                    defaultValue="Intrend Agency"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return <EnhancedBillingPage />;

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Theme Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dashboard Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'white' | 'dark')}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="white">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Accent Color</label>
                  <div className="flex space-x-2">
                    {['blue', 'green', 'purple', 'red', 'orange'].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          color === 'blue' ? 'border-blue-500' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : color === 'purple' ? '#8B5CF6' : color === 'red' ? '#EF4444' : '#F59E0B' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Select a tab to view settings</p>
          </div>
        );
    }
  };

  // If billing tab is active, render the enhanced billing page with full menu structure
  if (activeTab === 'billing') {
    return <EnhancedBillingPage />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'white' ? 'bg-gray-50' : 'bg-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-900' : 'text-gray-100'
          }`}>Settings</h1>
          <p className={`text-lg transition-colors duration-300 ${
            theme === 'white' ? 'text-gray-600' : 'text-gray-400'
          }`}>Manage your account preferences and settings</p>
        </div>

        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className={`space-y-1 rounded-lg p-4 transition-colors duration-300 ${
              theme === 'white' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'
            }`}>
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? theme === 'white'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-blue-900/20 text-blue-300'
                        : theme === 'white'
                          ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          : 'text-gray-300 hover:text-gray-100 hover:bg-slate-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className={`rounded-lg p-6 transition-colors duration-300 ${
              theme === 'white' ? 'bg-white border border-gray-200' : 'bg-slate-800 border border-slate-700'
            }`}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
