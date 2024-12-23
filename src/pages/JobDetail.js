import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, X, FileText, CheckCircle, 
  MapPin, Clock, Code, ExternalLink,
  Briefcase, Star, ArrowLeft, Users,
  Building, Link, Share2, Loader2,
  Edit2, Save
} from 'lucide-react';
import { jobService } from '../services/jobService';
import JobCVs from '../components/JobCVs';
import { useAuth } from '../context/AuthContext';
import { urlShortenerService } from '../services/urlShortenerService';
import ShareModal from '../components/ShareModal';
import EditJobModal from '../components/EditJobModal';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSocial, setCopiedSocial] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [shorteningUrl, setShorteningUrl] = useState(false);
  const { organization } = useAuth();
  const longUrl = `${process.env.REACT_APP_FRONTEND_URL}/${organization?.id}/jobs/${id}`;

  useEffect(() => {
    fetchJob();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
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
          {/* Move buttons to main header and improve visibility */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-secondary-light hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 md:h-4 md:w-4 mr-2" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors flex-1 md:flex-none text-sm"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Position
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors flex-1 md:flex-none text-sm"
                >
                  <Share2 className="h-4 w-4" />
                  Share Position
                </button>
              </div>
          </div>

          {/* Job Info */}
          <div className="flex flex-col md:flex-row md:items-start md:gap-4">
            <div className="bg-white/10 p-2 md:p-3 rounded-lg mb-3 md:mb-0">
              <Briefcase className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">{job.title}</h1>
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-6 text-sm md:text-base text-secondary-light">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{job.workType}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{job.employmentType}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Posted {formatDate(job.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>

            {/* Skills */}
            <div className="grid md:grid-cols-2 gap-6 p-4 md:p-6 bg-white/10 rounded-xl">
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 md:p-8">
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