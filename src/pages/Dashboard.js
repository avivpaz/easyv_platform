import React, { useState, useEffect } from 'react';
import { Link, useNavigate,useSearchParams } from 'react-router-dom';
import { 
  Briefcase, Users, Calendar, Search, Plus,
  ChevronRight, MapPin, Clock, DollarSign,
  TrendingUp, Filter, ArrowUp, BarChart, Loader, Trash2
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
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, logout } = useAuth();  // Get logout from useAuth

  useEffect(() => {
    const createJob = searchParams.get('createJob');
    const prompt = searchParams.get('prompt');
    if (createJob === 'true' && prompt) {
      const decodedPrompt = decodeURIComponent(prompt);
      setInitialJobDescription(decodedPrompt);
      setAutoSubmit(true);
      setIsCreateModalOpen(true);
      // Clean up URL without triggering a refresh
      setSearchParams({}, { replace: true });
    }else
     {
      if (isAuthenticated)
        fetchJobs();
     else{
      logout()
     }
    }

  }, [isAuthenticated]);
  
  const handleJobClick = (jobId, event) => {
    if (event.target.closest('.delete-button')) {
      return;
    }
    navigate(`/jobs/${jobId}`);
  };

  

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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-white">Job Dashboard</h1>
          <p className="text-secondary-light mt-1">Your Job Listings Dashboard</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4"> {/* Changed to vertical spacing */}
          {jobs.map((job) => (
            <div
              key={job._id}
              className="group bg-white border border-gray-200 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer relative w-full"
            >
              <div className="absolute top-3 right-3 z-10">
                <button
                  className="delete-button p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete job"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary/70" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
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
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">
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

                    <div className="mt-3 space-y-2">
                      {job.requiredSkills.length > 0 && (
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
                      {job.niceToHaveSkills.length > 0 && (
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;