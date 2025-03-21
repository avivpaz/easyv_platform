// services/jobService.js
import api from './api';

export const jobService = {
  async getJobs(params = {}) {
    try {
      const { page = 1, limit = 10,search='' } = params;
      const response = await api.get('/jobs', { 
        params: { 
          page,
          limit,
          search
        }
      });
      
      // If the response has the expected pagination structure
      if (response.data && response.data.jobs && response.data.pagination) {
        return {
          jobs: response.data.jobs,
          pagination: response.data.pagination
        };
      }
      
      // Fallback for backward compatibility or unexpected response structure
      const jobsData = response.data.jobs || response.data || [];
      return {
        jobs: Array.isArray(jobsData) ? jobsData : [],
        pagination: {
          total: jobsData.length,
          pages: 1,
          page: 1,
          limit: jobsData.length
        }
      };
    } catch (error) {
      console.error('Error in jobService:', error);
      return {
        jobs: [],
        pagination: {
          total: 0,
          pages: 0,
          page: 1,
          limit: 10
        }
      };
    }
  },
  async createJob(jobData) {
    try {
      const response = await api.post('/jobs', jobData);
      console.log('Create Job Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error(error.response?.data?.error || 'Failed to create job');
    }
  },
  async updateJob(id, jobData) {
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw new Error(error.response?.data?.error || 'Failed to update job');
    }
  },
  async deleteJob(id) {
    try {
      const response = await api.delete(`/jobs/${id}`);
      console.log('Delete Job Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete job');
    }
  },
  async getJob(id) {
    try {
      const response = await api.get(`/jobs/${id}`);
      console.log('Single Job Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch job details');
    }
  },
  async uploadCVs(jobId, files) {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('cvs', file);
      });
      formData.append('jobId', jobId);

      const response = await api.post(`/jobs/${jobId}/cv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading CVs:', error);
      throw error;
    }
  },
  async getJobCVs(jobId) {
    try {
      const response = await api.get(`/jobs/${jobId}/cv`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job CVs:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch job CVs');
    }
  },
  async deleteCV(cvId) {
    try {
      const response = await api.delete(`/cv/${cvId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting CV:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete CV');
    }
  },
  async generateJobDetails(description) {
    try {
      const response = await api.post('/jobs/description', { description });
      return response.data;
    } catch (error) {
      console.error('Error generating job details:', error);
      throw new Error(error.response?.data?.error || 'Failed to generate job details');
    }
  },
  async updateJobStatus(id, status) {
    try {
      const response = await api.patch(`/jobs/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw new Error(error.response?.data?.error || 'Failed to update job status');
    }
  },
  async getSocialShareText(jobId, platform = 'linkedin') {
    try {
      const response = await api.get(`/jobs/${jobId}/social-share`, {
        params: { platform }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating social share text:', error);
      throw new Error(error.response?.data?.error || 'Failed to generate social share text');
    }
  },
  async getPostingPlatformSuggestions(jobId) {
    try {
      const response = await api.get(`/jobs/${jobId}/posting-platforms`);
      return response.data;
    } catch (error) {
      console.error('Error getting posting platform suggestions:', error);
      throw new Error(error.response?.data?.error || 'Failed to get posting platform suggestions');
    }
  }
};
