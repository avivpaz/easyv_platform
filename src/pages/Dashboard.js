// JobDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Briefcase, Users, Search, Plus, MapPin, 
  Clock, Trash2, Loader
} from 'lucide-react';
import { jobService } from '../services/jobService';
import CreateJobModal from '../components/CreateJobModal';
import DeleteDialog from '../components/DeleteDialog';
import { useAuth } from '../context/AuthContext';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const JobDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [initialJobDescription, setInitialJobDescription] = useState('');
  const [autoSubmit, setAutoSubmit] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const createJob = searchParams.get('createJob');
    const prompt = searchParams.get('prompt');
    
    if (createJob === 'true' && prompt) {
      const decodedPrompt = decodeURIComponent(prompt);
      setInitialJobDescription(decodedPrompt);
      setAutoSubmit(true);
      setIsCreateModalOpen(true);
      setSearchParams({}, { replace: true });
    } else if (isAuthenticated) {
      fetchJobs();
    } else {
      logout();
    }
  }, [isAuthenticated]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobs();
      setJobs(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await jobService.deleteJob(jobId);
      await fetchJobs();
      setJobToDelete(null);
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again later.');
    }
  };

  const handleJobClick = (jobId, event) => {
    // Prevent navigation if clicking delete button
    if (event.target.closest('.delete-button')) {
      return;
    }
    navigate(`/jobs/${jobId}`);
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={fetchJobs}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Job Dashboard</h1>
          <p className="text-white/80">Manage and track all your job listings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-xl mx-auto">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first job posting.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Job</span>
            </button>
          </div>
        ) : (
          <>
            {/* Search and Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-lg font-medium text-gray-900 whitespace-nowrap">
                  Jobs ({filteredJobs.length})
                </h2>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Create Job</span>
              </button>
            </div>

            {/* Job Cards */}
            <div className="grid gap-4 mx-auto max-w-3xl">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={(e) => handleJobClick(job._id, e)}
                  className="group bg-white border border-gray-200 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer relative"
                >
                  {/* Delete Button */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => setJobToDelete(job)}
                      className="delete-button p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 hidden sm:block">
                        <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary/70" />
                        </div>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        {/* Title and Status */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <span className={`
                            inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${job.status === 'active' ? 'bg-green-50 text-green-700' :
                              job.status === 'draft' ? 'bg-gray-50 text-gray-600' :
                              'bg-red-50 text-red-700'
                            }
                          `}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(job.createdAt)}
                          </span>
                        </div>

                        {/* Job Details */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1 min-w-[120px]">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>{job.workType}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 shrink-0" />
                            <span>{job.employmentType}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        {(job.requiredSkills.length > 0 || job.niceToHaveSkills.length > 0) && (
                          <div className="mt-3 space-y-2">
                            {job.requiredSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {job.requiredSkills.map((skill, index) => (
                                  <span
                                    key={`req-${index}`}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                            {job.niceToHaveSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {job.niceToHaveSkills.map((skill, index) => (
                                  <span
                                    key={`nice-${index}`}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-600"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog 
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={() => handleDeleteJob(jobToDelete?._id)}
        title="Delete Job Posting"
        message={`Are you sure you want to delete "${jobToDelete?.title}"? This action cannot be undone.`}
        confirmButtonText="Delete Job"
      />

      {/* Create Job Modal */}
      <CreateJobModal 
        isOpen={isCreateModalOpen} 
        onClose={() => {
          setIsCreateModalOpen(false);
          setInitialJobDescription('');
          setAutoSubmit(false);
        }}
        onSuccess={fetchJobs}
        initialDescription={initialJobDescription}
        autoSubmit={autoSubmit}
      />
    </div>
  );
};

export default JobDashboard;