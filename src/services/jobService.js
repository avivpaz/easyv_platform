// services/jobService.js
import api from './api';


  
export const jobService = {
  async getJobs() {
    try {
      const response = await api.get('/jobs');
      console.log('API Response:', response); // Debug log
      // Handle different response structures
      const jobsData = response.data || [];
      return Array.isArray(jobsData) ? jobsData : [];
    } catch (error) {
      console.error('Error in jobService:', error);
      return [];
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
  async generateJobDetails(title) {
    try {
      const response = await api.post('/jobs/description', { title });
      return response.data;
    } catch (error) {
      console.error('Error generating job details:', error);
      throw new Error(error.response?.data?.error || 'Failed to generate job details');
    }
  }

};
