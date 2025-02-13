import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, Clock, Briefcase, User2, Calendar,
  Building, Share2, Edit2, Loader2, DollarSign
} from 'lucide-react';
import { jobService } from '../services/jobService';
import JobCVs from '../components/JobCVs';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';
import EditJobModal from '../components/EditJobModal';
import { urlShortenerService } from '../services/urlShortenerService';
import JobStatusDropdown from '../components/JobStatusDropdown';
import JobCreatedModal from '../components/JobCreatedModal';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [shorteningUrl, setShorteningUrl] = useState(false);
  const { organization } = useAuth();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'applications'
  const [showCreatedModal, setShowCreatedModal] = useState(false);

  // Get search params once, not on every render
  const searchParams = new URLSearchParams(location.search);
  const justCreated = location.state?.justCreated || searchParams.get('justCreated') === 'true';

  useEffect(() => {
    const fetchJobAndInit = async () => {
      try {
        setLoading(true);
        // Fetch job data
        const data = await jobService.getJob(id);
        setJob(data);
        setError(null);
        
        // Show the created modal if we just created this job or if justCreated is in the URL
        if (justCreated) {
          setShowCreatedModal(true);
          // Remove justCreated from URL without refreshing the page
          const newSearchParams = new URLSearchParams(location.search);
          newSearchParams.delete('justCreated');
          const newSearch = newSearchParams.toString();
          const newPath = location.pathname + (newSearch ? `?${newSearch}` : '');
          navigate(newPath, { replace: true, state: {} });
        }

        // Only try to shorten URL if we have the organization
        if (organization?.id) {
          try {
            const jobUrl = `${process.env.REACT_APP_FRONTEND_URL}/${organization.id}/jobs/${id}`;
            const shortened = await urlShortenerService.shortenUrl(jobUrl);
            setShortUrl(shortened);
          } catch (error) {
            console.error('Error shortening URL:', error);
          }
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndInit();
  }, [id, justCreated, organization?.id, location.pathname, location.search, navigate]);

  // Compute the longUrl only when needed
  const getLongUrl = () => {
    if (!organization?.id) return '';
    return `${process.env.REACT_APP_FRONTEND_URL}/${organization.id}/jobs/${id}`;
  };

  const renderDetails = () => {
    const details = [];

    if (job.location) {
      details.push(
        <div key="location" className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          <span>{job.location}</span>
        </div>
      );
    }

    if (job.workType && job.employmentType) {
      details.push(
        <div key="type" className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          <span className="capitalize">{job.workType} • {job.employmentType}</span>
        </div>
      );
    }

    if (job.salaryMin || job.salaryMax) {
      details.push(
        <div key="salary" className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
          <span>
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
          </span>
        </div>
      );
    }

    if (job.createdAt) {
      details.push(
        <div key="date" className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span>Posted {formatDate(job.createdAt)}</span>
        </div>
      );
    }

    return details.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {details}
      </div>
    ) : null;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await jobService.updateJobStatus(id, newStatus);
      await fetchJob();
    } catch (err) {
      console.error('Error updating job status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJob(id);
      setJob(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchJob();
    setShowEditModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (min, max, currency = 'USD', period = 'year') => {
    if (!min && !max) return 'Not specified';
    const formatNum = (num) => num.toLocaleString();
    const range = min && max 
      ? `${formatNum(min)}-${formatNum(max)}`
      : min 
        ? `${formatNum(min)}+` 
        : `Up to ${formatNum(max)}`;
    return `${range}k ${currency}/${period}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-base font-medium text-gray-700">Loading job details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-md w-full">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-white">{job.title}</h1>
              <JobStatusDropdown 
                currentStatus={job.status}
                onStatusChange={handleStatusUpdate}
                isUpdating={isUpdatingStatus}
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <a
                href={getLongUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white text-primary hover:bg-white/90 rounded-md text-sm font-medium transition-colors"
              >
                <User2 className="h-4 w-4 mr-2" />
                View as Candidate
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Job Information
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Applications
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'info' ? (
          // Job Information Tab
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Job Information</h3>
                </div>
                <div className="p-6 space-y-6">
                  {renderDetails()}
                  {job.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Required Skills</h3>
                </div>
                <div className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-primary/10 text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {job.niceToHaveSkills?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Nice to Have</h3>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {job.niceToHaveSkills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Applications Tab
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4">
              <JobCVs jobId={job._id} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <JobCreatedModal 
        isOpen={showCreatedModal}
        onClose={() => setShowCreatedModal(false)}
        job={job}
        onShare={() => {
          setShowCreatedModal(false);
          setShowShareModal(true);
        }}
        onViewAsCandidate={() => {
          const url = getLongUrl();
          if (url) window.open(url, '_blank');
          setShowCreatedModal(false);
        }}
      />
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        job={job}
        shortUrl={shortUrl}
        longUrl={getLongUrl()}
        shorteningUrl={shorteningUrl}
      />

      {showEditModal && (
        <EditJobModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          job={job}
        />
      )}
    </div>
  );
};

export default JobDetail;