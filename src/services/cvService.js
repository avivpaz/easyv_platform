// services/cvService.js
import api from './api';

export const cvService = {
  async updateCVStatus(cvId, status) {
    try {
      const response = await api.put(`/cvs/${cvId}/status`, { status });
      console.log('Update CV Status Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating CV status:', error);
      throw new Error(error.response?.data?.error || 'Failed to update CV status');
    }
  },
  
  async deleteCV(cvId) {
    try {
      const response = await api.delete(`/cvs/${cvId}`);
      console.log('Delete CV Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error deleting CV:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete CV');
    }
  },

  async getJobCVs(jobId, status = ['pending', 'reviewed']) {
    try {
      const response = await api.get(`/jobs/${jobId}/cv`, {
        params: { 
          status: status === 'all' ? ['pending', 'reviewed', 'rejected'] : status 
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch CVs');
    }
  },

  async downloadCV(cvId) {
    try {
      const response = await api.get(`/cvs/${cvId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading CV:', error);
      throw new Error(error.response?.data?.error || 'Failed to download CV');
    }
  }
};