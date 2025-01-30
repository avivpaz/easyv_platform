import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, Check, Loader2, Plus, Trash2, Facebook, Linkedin, AtSign, Share2, ChevronDown } from 'lucide-react';
import EmailProvider from '../components/integrations/email/EmailProvider';
import integrationsService from '../services/integrationsService';
import ConnectEmailModal from '../components/integrations/email/ConnectEmailModal';


const IntegrationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('email');
  const [connectedEmails, setConnectedEmails] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchEmailIntegrations();
  }, []);

  const fetchEmailIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await integrationsService.getEmailIntegrations();
      setConnectedEmails(data);
    } catch (err) {
      setError('Failed to load email integrations. Please try again.');
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (providerId) => {
    setConnecting(true);
    setError(null);
    
    try {
      const result = await integrationsService.connectGmail(providerId);
      await fetchEmailIntegrations(); // Refresh the list after successful connection
      setShowConnectModal(false);
    } catch (err) {
      setError('Failed to connect email account. Please try again.');
      console.error('Connection error:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async (integrationId) => {
    try {
      setError(null);
      await integrationsService.syncIntegration(integrationId);
      await fetchEmailIntegrations(); // Refresh the list after sync
    } catch (err) {
      setError('Failed to sync email account. Please try again.');
      console.error('Sync error:', err);
    }
  };
  const handleDisconnect = async (integrationId) => {
    try {
      setError(null);
      await integrationsService.disconnectIntegration(integrationId);
      await fetchEmailIntegrations(); // Refresh the list after disconnection
    } catch (err) {
      setError('Failed to disconnect integration. Please try again.');
      console.error('Disconnect error:', err);
    }
  };

  const categories = [
    { 
      id: 'email', 
      name: 'Email Accounts', 
      icon: AtSign, 
      count: connectedEmails.length, 
      available: true 
    },
    { 
      id: 'social', 
      name: 'Social Media', 
      icon: Share2, 
      count: 0, 
      available: false 
    },
  ];

  const activeItem = categories.find(cat => cat.id === activeCategory);


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading integrations...</span>
          </div>
        </div>
      );
    }

    switch (activeCategory) {
      case 'email':
        return (
          <EmailProvider
            connectedEmails={connectedEmails}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onSync={handleSync}  // Add this line
            showConnectModal={showConnectModal}
            setShowConnectModal={setShowConnectModal}
          />
        );
      case 'social':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Social Media</h2>
              <p className="text-sm text-gray-500">Connect social media accounts to import candidates</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Facebook className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Facebook Jobs</h3>
                    <p className="text-sm text-gray-500">Import candidates from Facebook Jobs</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Coming Soon
                </span>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">LinkedIn</h3>
                    <p className="text-sm text-gray-500">Import candidates from LinkedIn</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  

  return (
    <div className="min-h-screen bg-gray-50 px-14">
      <div className="bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Integrations</h1>
          <p className="text-secondary-light mt-1 text-sm sm:text-base">Connect your services to import candidates automatically</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Navigation */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  disabled={!category.available || loading}
                  className={`w-full flex items-center justify-between p-4 text-left border-b border-gray-200 last:border-b-0
                    ${activeCategory === category.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
                    ${category.available && !loading ? 'hover:bg-gray-50' : 'opacity-60 cursor-not-allowed'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <category.icon className={`h-5 w-5 ${activeCategory === category.id ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${activeCategory === category.id ? 'text-primary' : 'text-gray-700'}`}>
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {category.count > 0 && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                        {category.count}
                      </span>
                    )}
                    {!category.available && (
                      <span className="text-xs text-gray-500">Soon</span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {/* Mobile Category Dropdown */}
            <div className="lg:hidden mb-6 relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  {activeItem && (
                    <>
                      <activeItem.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-gray-900">{activeItem.name}</span>
                    </>
                  )}
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white rounded-lg border border-gray-200 shadow-lg">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setIsDropdownOpen(false);
                      }}
                      disabled={!category.available || loading}
                      className={`w-full flex items-center justify-between p-4 text-left border-b border-gray-200 last:border-b-0
                        ${category.available && !loading ? 'hover:bg-gray-50' : 'opacity-60 cursor-not-allowed'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <category.icon className={`h-5 w-5 ${category.id === activeCategory ? 'text-primary' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${category.id === activeCategory ? 'text-primary' : 'text-gray-700'}`}>
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {category.count > 0 && (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                            {category.count}
                          </span>
                        )}
                        {!category.available && (
                          <span className="text-xs text-gray-500">Soon</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {renderContent()}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      <ConnectEmailModal 
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default IntegrationsPage;