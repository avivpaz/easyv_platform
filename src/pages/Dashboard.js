import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
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
import JobItem from '../components/JobItem';  // Import the JobItem component



const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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
  useEffect(() => {
    const createJob = searchParams.get('createJob');
    const prompt = searchParams.get('prompt');
    const page = parseInt(searchParams.get('page')) || 1;
    
    if (createJob === 'true') {
      let decodedPrompt=''
      if (prompt)
      {
         decodedPrompt = decodeURIComponent(prompt);
         setAutoSubmit(true);
      }
      setInitialJobDescription(decodedPrompt);
      setIsCreateModalOpen(true);
      setSearchParams({}, { replace: true });
      if (isAuthenticated) {
        fetchJobs(page);
      }
    } else {
      if (isAuthenticated) {
        fetchJobs(page);
      } else {
        logout();
      }
    }
  }, [isAuthenticated]);

  const handleJobClick = (jobId, event) => {
    navigate(`/jobs/${jobId}`);
  };

  
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
    fetchJobs(newPage)
  };

  const fetchJobs = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      const response = await jobService.getJobs({ 
        page, 
        limit: 10,
        search: search 
      });
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

  const debouncedSearch = useCallback(
    _.debounce((term) => {
      fetchJobs(1, term);
    }, 500),
    []
  );
  
  const PaginationControls = () => {
    const { page, pages, total } = pagination;
    
    if (total === 0) return null;

    return (
      <div className="mt-6 flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 sm:px-6">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing {Math.min((page - 1) * 10 + 1, total)} to {Math.min(page * 10, total)} of {total} results
            </p>
          </div>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronFirst className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium 
                    ${page === pageNum ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pages}
              className="relative inline-flex items-center border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(pages)}
              disabled={page === pages}
              className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLast className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

 
  return (
    <div className="min-h-screen bg-gray-50 px-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Create Section */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              Jobs ({pagination.total})
            </h1>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search existing listings..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  debouncedSearch(e.target.value);
                }}
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

        {/* Jobs List Section */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-600">Loading jobs...</span>
              </div>
            </div>
          ) : jobs.length === 0 ? (
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
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} onClick={() => handleJobClick(job._id)}>
                  <JobItem 
                    job={job} 
                    onStatusChange={async (jobId, status) => {
                      try {
                        await jobService.updateJobStatus(jobId, status);
                        await fetchJobs();
                      } catch (err) {
                        console.error('Error updating job status:', err);
                        setError('Failed to update job status. Please try again later.');
                      }
                    }}
                  />
                </div>
              ))}
              <PaginationControls />
            </div>
          )}
        </div>
      </div>

      {/* Modals remain the same */}
      {isCreateModalOpen && (
        <CreateJobModal 
          isOpen={isCreateModalOpen} 
          onClose={() => {
            setIsCreateModalOpen(false);
            setInitialJobDescription('');
            setAutoSubmit(false);
          }}
          onSuccess={(jobId) => {
            navigate(`/jobs/${jobId}`);
          }}
          initialDescription={initialJobDescription}
          autoSubmit={autoSubmit}
        />
      )}

      {jobToDelete && (
        <DeleteDialog 
          isOpen={!!jobToDelete}
          onClose={() => setJobToDelete(null)}
          onConfirm={() => handleDeleteJob(jobToDelete?._id)}
          title="Delete Job Posting"
          message={`Are you sure you want to delete "${jobToDelete?.title}"? This action cannot be undone.`}
          confirmButtonText="Delete Job"
        />
      )}
    </div>
  );
};

export default Dashboard;

