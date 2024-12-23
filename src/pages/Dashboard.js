import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Briefcase, Users, Calendar, Search, Plus,
  ChevronRight, MapPin, Clock, DollarSign,
  ChevronFirst, ChevronLeft, ChevronLast, BarChart, Loader, Trash2, 
  AlertCircle
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

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [initialJobDescription, setInitialJobDescription] = useState('');
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10
  });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, logout, organization } = useAuth();

  useEffect(() => {
    const createJob = searchParams.get('createJob');
    const prompt = searchParams.get('prompt');
    const page = parseInt(searchParams.get('page')) || 1;
    
    if (createJob === 'true' && prompt) {
      const decodedPrompt = decodeURIComponent(prompt);
      setInitialJobDescription(decodedPrompt);
      setAutoSubmit(true);
      setIsCreateModalOpen(true);
      setSearchParams({}, { replace: true });
    } else {
      if (isAuthenticated) {
        fetchJobs(page);
      } else {
        logout();
      }
    }
  }, [isAuthenticated, searchParams]);

  const handleJobClick = (jobId, event) => {
    navigate(`/jobs/${jobId}`);
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await jobService.getJobs({ page, limit: 10 });
      setJobs(response.jobs);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const PaginationControls = () => {
    const { page, pages, total } = pagination;
    
    if (total === 0) return null;

    return (
      <div className="mt-6 flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {Math.min((page - 1) * 10 + 1, total)}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(page * 10, total)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{total}</span>{' '}
              results
            </p>
          </div>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ChevronFirst className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center border-t border-b border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center border-t border-b border-gray-300 px-4 py-2 text-sm font-medium 
                    ${page === pageNum
                      ? 'z-10 border-primary bg-primary text-white hover:bg-primary-dark'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                    }
                    ${i === 0 ? 'border-l' : ''}
                  `}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pages}
              className="relative inline-flex items-center border-t border-b border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(pages)}
              disabled={page === pages}
              className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ChevronLast className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
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
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
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
    {organization?.needsSetup && (
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 py-4 text-sm">
              <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-gray-600">
                Complete your organization profile to customize your jobs landing page.
              </span>
              <Link 
                to="/settings/organization" 
                className="text-primary hover:text-primary-dark font-medium inline-flex items-center"
              >
                Complete Setup
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-white">Job Dashboard</h1>
          <p className="text-secondary-light mt-1">Your Job Listings Dashboard: View, Manage, and Track All Your Created Listings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
      {jobs.length === 0 && pagination.total === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first job posting.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Job</span>
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-lg font-medium text-gray-900 whitespace-nowrap">Jobs ({jobs.length})</h2>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search existing listings..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Create Job Listing</span>
              </button>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  onClick={(e) => handleJobClick(job._id, e)}
                  className="group bg-white border border-gray-200 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer relative w-full"
                >
                  {/* <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => setJobToDelete(job)}
                      className="delete-button p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div> */}

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary/70" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-lg font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                            {job.title}
                          </h2>
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.status === 'active' ? 'bg-green-50 text-green-700' :
                            job.status === 'draft' ? 'bg-gray-50 text-gray-600' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(job.createdAt)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.workType}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{job.employmentType}</span>
                          </div>
                        </div>

                        {/* Skills Section */}
                        {(job.requiredSkills?.length > 0 || job.niceToHaveSkills?.length > 0) && (
                          <div className="mt-3 space-y-2">
                            {job.requiredSkills?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.map((skill, index) => (
                                  <span
                                    key={`req-${index}`}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                            {job.niceToHaveSkills?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {job.niceToHaveSkills.map((skill, index) => (
                                  <span
                                    key={`nice-${index}`}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-600"
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
            <PaginationControls />

          </>
        )}
      </div>

      <DeleteDialog 
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={() => handleDeleteJob(jobToDelete?._id)}
        title="Delete Job Posting"
        message={`Are you sure you want to delete "${jobToDelete?.title}"? This action cannot be undone.`}
        confirmButtonText="Delete Job"
      />

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

export default Dashboard;