import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, X, FileText, CheckCircle, 
  MapPin, Clock, Code, ExternalLink,
  Briefcase, Star, ArrowLeft, Users,
  Building, Link, Share2, Loader2
} from 'lucide-react';
import { jobService } from '../services/jobService';
import JobCVs from '../components/JobCVs';
import { useAuth } from '../context/AuthContext';
import { urlShortenerService } from '../services/urlShortenerService';
import ShareModal from '../components/ShareModal';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSocial, setCopiedSocial] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [shorteningUrl, setShorteningUrl] = useState(false);
  const { organization } = useAuth();
  const longUrl = `${process.env.REACT_APP_FRONTEND_URL}/${organization?.id}/jobs/${id}`;

  useEffect(() => {
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (showShareModal && !shortUrl) {  // Only if we don't already have a short URL
      shortenUrl();
    }
  }, [showShareModal]);
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
  const shortenUrl = async () => {
    if (shortUrl) return; // Don't shorten if we already have a short URL
    
    setShorteningUrl(true);
    try {
      const shortened = await urlShortenerService.shortenUrl(longUrl);
      if (shortened && shortened !== longUrl) {  // Check if we got a valid shortened URL
        setShortUrl(shortened);  // This is where we set the short URL
      }
    } catch (error) {
      console.error('Error shortening URL:', error);
      // Optionally show an error message to the user
    } finally {
      setShorteningUrl(false);
    }
  };


  useEffect(() => {
    fetchJob();
  }, [id]);

 
  const handleViewInNewTab = () => {
    window.open(longUrl, '_blank');
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
            {/* Header */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-secondary-light hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">Back to Dashboard</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleViewInNewTab}
                  className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden md:inline">View</span>
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden md:inline">Share Position</span>
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

       {/* Skills section with switched colors */}
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

      <ShareModal 
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  job={job}
  shortUrl={shortUrl}
  longUrl={longUrl}
  shorteningUrl={shorteningUrl}
/>
    </div>
  );
};

export default JobDetail;