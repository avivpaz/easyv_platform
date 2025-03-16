import React, { useState, useEffect } from 'react';
import { jobService } from '../services/jobService';
import { X, Copy, Loader2, ExternalLink } from 'lucide-react';

const PlatformSuggestionsModal = ({ jobId, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [activeTab, setActiveTab] = useState('generalJobPlatforms');
  const [copiedItem, setCopiedItem] = useState(null);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchSuggestions();
    }
  }, [isOpen, jobId]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobService.getPostingPlatformSuggestions(jobId);
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error('Error fetching platform suggestions:', err);
      setError('Failed to load platform suggestions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, itemId) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Fallback function in case the API doesn't provide a URL
  const getFallbackUrl = (name, type) => {
    const encodedName = encodeURIComponent(name);
    
    switch (type) {
      case 'generalJobPlatforms':
        return `https://www.google.com/search?q=${encodedName}+job+site`;
      case 'linkedinGroups':
        return `https://www.linkedin.com/search/results/groups/?keywords=${encodedName}`;
      case 'facebookGroups':
        return `https://www.facebook.com/search/groups/?q=${encodedName}`;
      case 'redditCommunities':
        if (name.startsWith('r/')) {
          return `https://www.reddit.com/${name}`;
        }
        return `https://www.reddit.com/search/?q=${encodedName}`;
      default:
        return `https://www.google.com/search?q=${encodedName}`;
    }
  };

  const tabs = [
    { id: 'generalJobPlatforms', label: 'Job Platforms', count: suggestions?.generalJobPlatforms?.length || 0 },
    { id: 'specializedJobBoards', label: 'Specialized Boards', count: suggestions?.specializedJobBoards?.length || 0 },
    { id: 'linkedinGroups', label: 'LinkedIn Groups', count: suggestions?.linkedinGroups?.length || 0 },
    { id: 'facebookGroups', label: 'Facebook Groups', count: suggestions?.facebookGroups?.length || 0 },
    { id: 'redditCommunities', label: 'Reddit Communities', count: suggestions?.redditCommunities?.length || 0 },
    { id: 'otherPlatforms', label: 'Other Platforms', count: suggestions?.otherPlatforms?.length || 0 }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Where to Post Your Job</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="ml-2 text-gray-600">Analyzing job details and generating suggestions...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-8 text-red-500">
            {error}
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b sticky top-0 bg-white z-10">
              <div className="flex flex-wrap px-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'text-indigo-600 border-b-2 border-indigo-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={tab.count === 0}
                  >
                    {tab.label} {tab.count > 0 && `(${tab.count})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {suggestions && suggestions[activeTab]?.length > 0 ? (
                <div className="space-y-4">
                  {suggestions[activeTab].map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <div className="flex items-center space-x-2">
                          <a
                            href={item.url || getFallbackUrl(item.name, activeTab)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 flex items-center"
                            title="Visit platform"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleCopy(item.name, `${activeTab}-${index}`)}
                            className="text-gray-400 hover:text-gray-600 flex items-center"
                            title="Copy name"
                          >
                            {copiedItem === `${activeTab}-${index}` ? (
                              <span className="text-green-500 text-xs">Copied!</span>
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600">{item.reason}</p>
                      
                      {item.audienceSize && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Audience Size:</span> {item.audienceSize}
                        </div>
                      )}
                      
                      {item.postingTips && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-md">
                          <h4 className="text-xs font-medium text-gray-700 uppercase">Posting Tips</h4>
                          <p className="mt-1 text-sm text-gray-600">{item.postingTips}</p>
                        </div>
                      )}
                      
                      <div className="mt-3 flex justify-end">
                        <a
                          href={item.url || getFallbackUrl(item.name, activeTab)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit {activeTab === 'generalJobPlatforms' ? 'Platform' : 
                                activeTab === 'specializedJobBoards' ? 'Job Board' :
                                activeTab === 'linkedinGroups' ? 'LinkedIn Group' :
                                activeTab === 'facebookGroups' ? 'Facebook Group' :
                                activeTab === 'redditCommunities' ? 'Reddit Community' : 'Site'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No suggestions available for this category.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t p-4 flex justify-between items-center bg-gray-50">
          <p className="text-xs text-gray-500">
            Suggestions are based on job description, location, and required skills.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformSuggestionsModal; 