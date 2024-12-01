import React, { useState, useEffect } from 'react';
import { Link ,useNavigate} from 'react-router-dom';
import { 
  Briefcase, Users, Calendar, Search, Plus,
  ChevronRight, MapPin, Clock, DollarSign,
  TrendingUp, Filter, ArrowUp, BarChart, Loader, Trash2
} from 'lucide-react';
import { jobService } from '../services/jobService';
import CreateJobModal from '../components/CreateJobModal';
import DeleteDialog from '../components/DeleteDialog';
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);
    const navigate = useNavigate();

    const handleJobClick = (jobId, event) => {
      // Prevent navigation if clicking on delete button
      if (event.target.closest('.delete-button')) {
        return;
      }
      navigate(`/jobs/${jobId}`);
    };
    useEffect(() => {
      fetchJobs();
    }, []);
  
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

    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );

    if (error) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={fetchJobs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );

    const renderContent = () => {
      if (jobs.length === 0) {
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first job posting.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Create Job</span>
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Job Listings</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Job</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {jobs.map((job) => (
    <div
      key={job._id}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex flex-col space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h2>
                <div className="mt-1 flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    job.status === 'active' ? 'bg-green-100 text-green-700' :
                    job.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </div>
                  <span className="text-sm text-gray-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setJobToDelete(job)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete job"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <Link
                to={`/jobs/${job._id}`}
                state={{ job }}
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
              >
                View Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 px-4 py-3 rounded-xl">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </div>
              <div className="font-medium text-gray-900">{job.location}</div>
            </div>
            <div className="bg-gray-50 px-4 py-3 rounded-xl">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Clock className="h-4 w-4 mr-2" />
                Work Type
              </div>
              <div className="font-medium text-gray-900">{job.workType}</div>
            </div>
            <div className="bg-gray-50 px-4 py-3 rounded-xl">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Briefcase className="h-4 w-4 mr-2" />
                Employment
              </div>
              <div className="font-medium text-gray-900">{job.employmentType}</div>
            </div>
            <div className="bg-gray-50 px-4 py-3 rounded-xl">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <Users className="h-4 w-4 mr-2" />
                Required Skills
              </div>
              <div className="font-medium text-gray-900">{job.requiredSkills.length}</div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {job.niceToHaveSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Nice to Have</h4>
                <div className="flex flex-wrap gap-2">
                  {job.niceToHaveSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-medium"
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

      {/* Footer Stats */}
  
    </div>
    
    ))}
    </div>
  </div>
);
};


return (
  <div className="min-h-screen bg-gray-50">
    {/* Header Section */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-white">Job Dashboard</h1>
        <p className="text-blue-100 mt-1">Manage and track your job listings</p>
      </div>
    </div>

    {/* Search and Create Section */}
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Job</span>
        </button>
      </div>

      {/* Job Listings */}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job._id}
            onClick={(e) => handleJobClick(job._id, e)}
            className="group bg-white border border-gray-200 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer relative"
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setJobToDelete(job)}
                className="delete-button p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="Delete job"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
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
                  {(job.requiredSkills.length > 0 || job.niceToHaveSkills.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill, index) => (
                        <span
                          key={`req-${index}`}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
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
        ))}
      </div>
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
      onClose={() => setIsCreateModalOpen(false)}
      onSuccess={fetchJobs}
    />
  </div>
);
};

export default Dashboard;