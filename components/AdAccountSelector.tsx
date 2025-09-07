'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Check, Square } from 'lucide-react';

interface AdAccount {
  id: string;
  name: string;
  account_status?: string;
  currency?: string;
  timezone_name?: string;
}

interface AdAccountSelectorProps {
  adAccounts: AdAccount[];
  onConfirm: (selectedAccounts: AdAccount[]) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export default function AdAccountSelector({ 
  adAccounts, 
  onConfirm, 
  onCancel, 
  isVisible 
}: AdAccountSelectorProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Initialize with all accounts selected by default
  useEffect(() => {
    if (adAccounts.length > 0) {
      const allAccountIds = new Set(adAccounts.map(account => account.id));
      setSelectedAccounts(allAccountIds);
      setSelectAll(true);
    }
  }, [adAccounts]);

  const handleAccountToggle = (accountId: string) => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(accountId)) {
      newSelected.delete(accountId);
    } else {
      newSelected.add(accountId);
    }
    setSelectedAccounts(newSelected);
    setSelectAll(newSelected.size === adAccounts.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAccounts(new Set());
      setSelectAll(false);
    } else {
      const allAccountIds = new Set(adAccounts.map(account => account.id));
      setSelectedAccounts(allAccountIds);
      setSelectAll(true);
    }
  };

  const handleConfirm = () => {
    const selectedAdAccounts = adAccounts.filter(account => 
      selectedAccounts.has(account.id)
    );
    onConfirm(selectedAdAccounts);
  };

  const getAccountStatusColor = (status?: string | any) => {
    const statusStr = typeof status === 'string' ? status.toLowerCase() : 'unknown';
    switch (statusStr) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'disabled':
        return 'text-red-600 bg-red-50';
      case 'pending_review':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAccountStatusText = (status?: string | any) => {
    const statusStr = typeof status === 'string' ? status.toLowerCase() : 'unknown';
    switch (statusStr) {
      case 'active':
        return 'Active';
      case 'disabled':
        return 'Disabled';
      case 'pending_review':
        return 'Pending Review';
      default:
        return 'Unknown';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Select Ad Accounts for Subscription
              </h2>
              <p className="text-gray-600 mt-2">
                Choose which Facebook ad accounts you want to include in your subscription plan. 
                You can add or remove accounts later.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Summary */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-blue-900">
                  {adAccounts.length} Ad Account{adAccounts.length !== 1 ? 's' : ''} Found
                </h3>
                <p className="text-sm text-blue-700">
                  {selectedAccounts.size} selected for subscription
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-600">
                  Estimated cost: ${selectedAccounts.size * 10}/month
                </div>
                <div className="text-xs text-blue-500">
                  (or ${Math.round(selectedAccounts.size * 10 * 12 * 0.8)}/year with 20% discount)
                </div>
              </div>
            </div>
          </div>

          {/* Select All Toggle */}
          <div className="mb-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {selectAll ? (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-700">
                {selectAll ? 'Deselect All' : 'Select All'}
              </span>
            </button>
          </div>

          {/* Ad Accounts List */}
          <div className="space-y-3 mb-6">
            {adAccounts.map((account) => {
              const isSelected = selectedAccounts.has(account.id);
              return (
                <div
                  key={account.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAccountToggle(account.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">
                            {account.name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountStatusColor(account.account_status)}`}>
                            {getAccountStatusText(account.account_status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>Account ID: {account.id}</div>
                          {account.currency && (
                            <div>Currency: {account.currency}</div>
                          )}
                          {account.timezone_name && (
                            <div>Timezone: {account.timezone_name}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        $10/month
                      </div>
                      <div className="text-xs text-gray-500">
                        per account
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cost Summary */}
          {selectedAccounts.size > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {selectedAccounts.size} ad account{selectedAccounts.size !== 1 ? 's' : ''} × $10.00
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    ${selectedAccounts.size * 10}/month
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Annual billing (20% off):</span>
                  <span className="font-medium text-green-600">
                    ${Math.round(selectedAccounts.size * 10 * 12 * 0.8)}/year
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Save ${Math.round(selectedAccounts.size * 10 * 12 * 0.2)} per year with annual billing
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedAccounts.size === 0}
              className={`px-6 py-2 rounded-md transition-colors ${
                selectedAccounts.size === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Continue with {selectedAccounts.size} Account{selectedAccounts.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
