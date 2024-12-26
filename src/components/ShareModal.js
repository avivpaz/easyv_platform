import { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { jobService } from '../services/jobService';

const ShareModal = ({ 
  isOpen, 
  onClose, 
  job, 
  shortUrl, 
  longUrl, 
  shorteningUrl 
}) => {
  // Store social posts with jobId to track if we already generated for this job
  const [socialPostsCache, setSocialPostsCache] = useState({
    jobId: null,
    posts: {
      facebook: '',
      linkedin: '',
      twitter: ''
    }
  });
  const [loadingSocialText, setLoadingSocialText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSocial, setCopiedSocial] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');

  const handlePlatformChange = (e) => {
    setSelectedPlatform(e.target.value);
    setCopiedSocial(false);
  };

  const getSocialShareText = async () => {
    if (!job) return;
    
    // Check if we already have generated posts for this job
    if (socialPostsCache.jobId === job._id) {
      return;
    }
    
    setLoadingSocialText(true);
    try {
      const data = await jobService.getSocialShareText(job._id);
      const shareUrl = shortUrl || longUrl;
      
      // Process each platform's text
      const processedPosts = data.posts.reduce((acc, post) => {
        acc[post.platform] = post.text.replace(/\{URL\}/g, shareUrl);
        return acc;
      }, {});
      
      // Store in cache with jobId
      setSocialPostsCache({
        jobId: job._id,
        posts: processedPosts
      });
    } catch (error) {
      console.error('Error getting social share text:', error);
      // Fallback texts for each platform
      const fallbackText = `${job.organization?.name || 'We\'re'} hiring a ${job.title}! 🚀\n\n` +
            `📍 ${job.location}\n` +
            `💼 ${job.employmentType} | ${job.workType}\n\n` +
            `Key skills: ${job.requiredSkills.slice(0, 3).join(', ')}\n\n` +
            `Apply now: ${shortUrl || longUrl}`;
      
      setSocialPostsCache({
        jobId: job._id,
        posts: {
          facebook: fallbackText,
          linkedin: fallbackText,
          twitter: fallbackText
        }
      });
    } finally {
      setLoadingSocialText(false);
    }
  };

  useEffect(() => {
    if (isOpen && job && socialPostsCache.jobId !== job._id) {
      getSocialShareText();
    }
  }, [isOpen, job?._id]); // Only depend on isOpen and job._id

  const platformOptions = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter/X' }
  ];

  const handleCopy = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleView = () => {
    window.open(shortUrl || longUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-t-xl md:rounded-xl p-4 md:p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share Position</h3>
          <button onClick={onClose} className="text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Application Link</label>
          <div className="flex items-center gap-2 bg-gray-50 p-2 md:p-3 rounded-lg">
            <input
              type="text"
              readOnly
              value={shorteningUrl ? "Generating short link..." : (shortUrl || longUrl)}
              className="flex-1 bg-transparent border-none text-sm focus:ring-0 text-gray-600"
            />
         
            <button
              onClick={() => handleCopy(shortUrl || longUrl, setCopied)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                copied ? 'bg-green-600' : 'bg-primary'
              } hover:bg-primary-light text-white`}
              disabled={shorteningUrl}
            >
              {shorteningUrl ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden md:inline">Copied!</span>
                </>
              ) : (
                'Copy'
              )}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
          <select
            value={selectedPlatform}
            onChange={handlePlatformChange}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {platformOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Post</label>
          <div className="bg-gray-50 p-2 md:p-3 rounded-lg mb-2">
            <textarea
              readOnly
              value={loadingSocialText ? 'Generating social share text...' : socialPostsCache.posts[selectedPlatform]}
              className="w-full bg-transparent border-none text-sm focus:ring-0 text-gray-600 min-h-[120px] resize-none"
            />
            <button
              onClick={() => handleCopy(socialPostsCache.posts[selectedPlatform], setCopiedSocial)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                copiedSocial ? 'bg-green-600' : 'bg-primary'
              } hover:bg-primary-light text-white mt-2`}
              disabled={loadingSocialText}
            >
              {loadingSocialText ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : copiedSocial ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                'Copy Social Post'
              )}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs md:text-sm text-gray-500">
          Share this link with candidates or post on social media to promote this position.
        </p>
      </div>
    </div>
  );
};

export default ShareModal;