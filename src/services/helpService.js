// services/helpService.js
import api from './api';

export const helpService = {
  async submitHelp(formData) {
    try {
      // Create FormData for file upload
      const data = new FormData();
      
      // Add text fields
      data.append('category', formData.category);
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (formData.priority) data.append('priority', formData.priority);
      if (formData.email) data.append('email', formData.email);
      
      // Add screenshot files
      formData.attachments?.forEach((file, index) => {
        data.append('screenshots', file.file);
      });

      const response = await api.post('/help', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Submit Help Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error submitting help request:', error);
      throw new Error(error.response?.data?.error || 'Failed to submit help request');
    }
  }
};