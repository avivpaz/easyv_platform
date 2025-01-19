import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, Briefcase, User2, EyeOff, Eye, ChevronDown,
  Building, Share2, Edit2, Loader2, DollarSign
} from 'lucide-react';
import { jobService } from '../services/jobService';
import JobCVs from '../components/JobCVs';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';
import EditJobModal from '../components/EditJobModal';
import {urlShortenerService} from '../services/urlShortenerService'
import JobStatusDropdown from '../components/JobStatusDropdown';


const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [shorteningUrl, setShorteningUrl] = useState(false);
  const { organization } = useAuth();
  const longUrl = `${process.env.REACT_APP_FRONTEND_URL}/${organization?.id}/jobs/${id}`;
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const shortenAndFetch = async () => {
      try {
        const shortened = await urlShortenerService.shortenUrl(longUrl);
        setShortUrl(shortened);
        await fetchJob();
      } catch (error) {
        // Handle any errors that might occur
        console.error('Error in shortenAndFetch:', error);
      }
    };
  
    shortenAndFetch();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await jobService.updateJobStatus(id, newStatus);
      await fetchJob(); // Refresh job data
    } catch (err) {
      console.error('Error updating job status:', err);
      // You might want to add error handling/notification here
    } finally {
      setIsUpdatingStatus(false);
    }
  };

 
  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJob(id);
      setJob(data);
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


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Job Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <JobStatusDropdown 
                    currentStatus={job.status}
                    onStatusChange={handleStatusUpdate}
                    isUpdating={isUpdatingStatus}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 md:px-4 md:flex md:items-center md:gap-2 text-sm"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="hidden md:inline">Edit</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-6 text-sm text-gray-600">
                {/* ... existing job details remain the same ... */}
              </div>
            </div>

            {/* Skills Section */}
            <div className="grid md:grid-cols-2 gap-6 mt-6 p-6 bg-gray-50 rounded-xl">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 rounded-lg text-xs md:text-sm font-medium bg-gray-200 text-gray-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {job.niceToHaveSkills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Nice to Have</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.niceToHaveSkills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 rounded-lg text-xs md:text-sm font-medium bg-primary/10 text-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-primary bg-primary/5 rounded-lg hover:bg-primary/10 text-sm font-medium"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <a
                href={longUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm font-medium"
              >
                <User2 className="h-4 w-4" />
                View as Candidate
              </a>
            </div>
          </div>
        </div>

        {/* Organization Setup Alert */}
        {organization?.needsSetup && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            {/* ... existing organization alert content ... */}
          </div>
        )}

        {/* CVs Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <JobCVs jobId={job._id} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        job={job}
        shortUrl={shortUrl}
        longUrl={longUrl}
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