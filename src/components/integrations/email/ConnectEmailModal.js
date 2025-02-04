
// src/components/email/ConnectEmailModal.js
import React, { useState } from 'react';
import { X, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import GmailProvider from './providers/GmailProvider';
import OutlookProvider from './providers/OutlookProvider';

const ConnectEmailModal = ({ isOpen, onClose, onConnect }) => {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const gmail = GmailProvider({
    onConnect: (result) => {
      onConnect(result);
      onClose();
      setConnecting(false);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
      setConnecting(false);
    }
  });

  const outlook = OutlookProvider();
  const providers = [gmail, outlook];

  const handleProviderSelect = async (provider) => {
    try {
      if (provider.available) {
        setConnecting(true);
        setError(null);
        await provider.connect();
      }
    } catch (error) {
      console.error('Failed to connect provider:', error);
      setError('Failed to connect provider');
      setConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
// In ConnectEmailModal, update to:
<div className="fixed inset-0 z-50 overflow-y-auto">
  <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity z-40" onClick={onClose} />
  <div className="flex min-h-full items-center justify-center p-4 z-50 relative">      <div className="relative w-full max-w-xl transform rounded-xl bg-white shadow-xl transition-all">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Connect Email Provider</h2>
                <p className="mt-1 text-sm text-gray-500">Select your email provider to continue</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="space-y-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider)}
                  disabled={!provider.available || connecting}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 
                    ${provider.available && !connecting ? 'hover:border-primary hover:bg-primary/5' : 'opacity-60 cursor-not-allowed'}
                  `}
                >
                <div className="flex items-center gap-4">
  <div className={`h-12 w-12 rounded-lg ${provider.backgroundColor} flex items-center justify-center`}>
    {typeof provider.icon === 'function' ? <provider.icon /> : (
      <img 
        src={provider.icon} 
        alt={provider.name} 
        className="h-6 w-6"
      />
    )}
  </div>
  <div className="text-left">
    <h3 className="font-medium text-gray-900">{provider.name}</h3>
    <p className="text-sm text-gray-500">{provider.description}</p>
  </div>
</div>
                  <ArrowRight className={`h-5 w-5 ${provider.available && !connecting ? 'text-gray-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">What permissions we'll request:</h4>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• Read emails to find CV attachments</li>
                    <li>• Apply labels to processed emails</li>
                    <li>• No access to send or delete emails</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectEmailModal;