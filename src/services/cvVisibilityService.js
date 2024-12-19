// services/cvVisibilityService.js
import api from './api';

export const cvVisibilityService = {
  async unlockCV(cvId) {
    try {
      const response = await api.post(`/cvs/${cvId}/unlock`);
      console.log('Unlock CV Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error unlocking CV:', error);
      if (error.response?.data?.error === 'Insufficient credits') {
        throw new Error('Not enough credits to unlock this CV');
      }
      throw new Error(error.response?.data?.error || 'Failed to unlock CV');
    }
  },

  async unlockCVs(cvIds) {
    try {
      const response = await api.post('/cvs/unlock', { cvIds });
      console.log('Bulk Unlock CVs Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error unlocking CVs:', error);
      if (error.response?.data?.error === 'Insufficient credits') {
        throw new Error('Not enough credits to unlock these CVs');
      }
      throw new Error(error.response?.data?.error || 'Failed to unlock CVs');
    }
  },

  async unlockNextCVsByJob(jobId, count) {
    try {
      const response = await api.post(`/jobs/${jobId}/unlock-cvs`, { count });
      console.log('Unlock Next CVs Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error unlocking next CVs:', error);
      if (error.response?.data?.error === 'Insufficient credits') {
        throw new Error('Not enough credits to unlock these CVs');
      }
      throw new Error(error.response?.data?.error || 'Failed to unlock CVs');
    }
  },

  async checkUnlockAvailability(cvIds) {
    try {
      const response = await api.post('/cvs/check-unlock', { cvIds });
      console.log('Check Unlock Availability Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error checking unlock availability:', error);
      throw new Error(error.response?.data?.error || 'Failed to check unlock availability');
    }
  },

  async getUnlockedCVs(jobId) {
    try {
      const response = await api.get(`/jobs/${jobId}/unlocked-cvs`);
      console.log('Get Unlocked CVs Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching unlocked CVs:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch unlocked CVs');
    }
  },

  async getCreditBalance() {
    try {
      const response = await api.get('/credits/balance');
      console.log('Get Credit Balance Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch credit balance');
    }
  }
};