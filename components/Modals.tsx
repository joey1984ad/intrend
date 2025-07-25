'use client'

import React from 'react';
import { X, Download } from 'lucide-react';
import FacebookLogin from './FacebookLogin';

interface ModalsProps {
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
  showAccountModal: boolean;
  setShowAccountModal: (show: boolean) => void;
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  handleFacebookSuccess: (accessToken: string, userId: string) => void;
  handleFacebookError: (error: string) => void;
  connectedAccounts: any[];
}

const Modals: React.FC<ModalsProps> = ({
  showConnectModal,
  setShowConnectModal,
  showAccountModal,
  setShowAccountModal,
  showExportModal,
  setShowExportModal,
  handleFacebookSuccess,
  handleFacebookError,
  connectedAccounts
}) => {
  const ConnectAccountModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Connect Facebook Account</h2>
          <button 
            onClick={() => setShowConnectModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect your Facebook Ads account to view real campaign data and insights.
          </p>
          <FacebookLogin 
            onSuccess={handleFacebookSuccess}
            onError={handleFacebookError}
          />
          <div className="text-sm text-gray-500">
            <p>• We'll only access your ad account data</p>
            <p>• Your data is encrypted and secure</p>
            <p>• You can disconnect at any time</p>
          </div>
        </div>
      </div>
    </div>
  );

  const AccountModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Manage Connected Accounts</h2>
          <button 
            onClick={() => setShowAccountModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          {connectedAccounts.length > 0 ? (
            <div className="space-y-3">
              {connectedAccounts.map(account => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-gray-600">
                      {account.campaigns} campaigns • Last sync: {account.lastSync}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      account.status === 'connected' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {account.status}
                    </span>
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No accounts connected yet.</p>
              <button 
                onClick={() => {
                  setShowAccountModal(false);
                  setShowConnectModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Connect Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ExportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Export Data</h2>
          <button 
            onClick={() => setShowExportModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option>CSV</option>
              <option>Excel</option>
              <option>PDF</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Last 12 Months</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Data
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Campaign Performance
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Charts and Graphs
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Demographic Data
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button 
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
            Export
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showConnectModal && <ConnectAccountModal />}
      {showAccountModal && <AccountModal />}
      {showExportModal && <ExportModal />}
    </>
  );
};

export default Modals; 