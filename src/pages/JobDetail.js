import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, Briefcase, User2, EyeOff,Eye,ChevronDown,
  Building, Share2, Edit2, Loader2
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-primary-light text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col space-y-6">
            {/* Job Info */}
            <div className="flex flex-col md:flex-row md:items-start md:gap-4">
              <div className="hidden md:block bg-white/10 p-3 rounded-lg">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h1 className="text-xl md:text-3xl font-bold">{job.title}</h1>
                    <JobStatusDropdown 
                      currentStatus={job.status}
                      onStatusChange={handleStatusUpdate}
                      isUpdating={isUpdatingStatus}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Edit Button */}
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 md:px-4 md:flex md:items-center md:gap-2 text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="hidden md:inline">Edit</span>
                    </button>

                 
                  </div>
                  </div>
                         <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-6 text-sm md:text-base text-secondary-light">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{job.location}</span>
                  </span>
                )}
                  <span className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span className="truncate capitalize">{job.workType}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="truncate capitalize">{job.employmentType}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="truncate">Created {formatDate(job.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="grid md:grid-cols-2 gap-6 p-6 bg-white/10 rounded-xl">
              <div>
                <h3 className="text-sm font-medium text-secondary-light mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-lg text-xs md:text-sm font-medium bg-white/10 text-secondary-light"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {job.niceToHaveSkills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-light mb-2">Nice to Have</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.niceToHaveSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-lg text-xs md:text-sm font-medium bg-primary/20 text-secondary-light border border-white/10"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <a
                href={longUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <User2 className="h-4 w-4" />
                <span>View as Candidate</span>
              </a>
            </div>
            {/* Action Buttons */}
        
          </div>
        </div>
      </div>

      {organization?.needsSetup && (
        <div className="max-w-7xl mx-auto px-4 -mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Organization setup required</h3>
                <p className="text-sm text-yellow-700">Complete your organization profile to customize your job landing page.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/settings/organization')}
              className="flex-shrink-0 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
            >
              Complete Setup
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
    {/* Share and View buttons */}
          <div className="p-4 md:px-8 md:pt-0 md:pb-8">
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