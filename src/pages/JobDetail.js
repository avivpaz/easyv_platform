import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, X, FileText, CheckCircle, 
  MapPin, Clock, Code, Building2,
  Briefcase, Star, ArrowLeft, Users,
  Building, Link, Share2
} from 'lucide-react';
import { jobService } from '../services/jobService';
import JobCVs from '../components/JobCVs';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const uploadUrl = `${process.env.REACT_APP_FRONTEND_URL}/jobs/${id}`;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col space-y-6">
            {/* Navigation */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-blue-100 hover:text-white w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>

            {/* Main Job Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{job.title}</h1>
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-blue-100">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.workType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.employmentType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Posted {formatDate(job.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Share Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share Position
              </button>
            </div>

            {/* Job Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/10 rounded-xl mt-6">
              <div>
                <h3 className="text-sm font-medium text-blue-100 mb-1">Required Skills</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-lg text-sm font-medium bg-white/20 text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-blue-100 mb-1">Nice to Have</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.niceToHaveSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-lg text-sm font-medium bg-white/20 text-white"
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-8">
            <JobCVs jobId={job._id} />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Position</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
              <input
                type="text"
                readOnly
                value={uploadUrl}
                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-600"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(uploadUrl);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Copy
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Share this link with candidates to let them apply directly for this position.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;