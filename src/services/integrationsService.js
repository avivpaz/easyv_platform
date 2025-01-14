// services/integrationsService.js
import api from './api';

export const integrationsService = {
  // Handle Gmail integration callback
  async connectGmail(code) {
    try {
      const response = await api.post('/integrations/gmail/connect', { code });
      return response.data;
    } catch (error) {
      console.error('Gmail connection error:', error);
      throw error;
    }
  },

  // Get all email integrations for the organization
  async getEmailIntegrations() {
    try {
      const response = await api.get('/integrations', {
        params: { type: 'email' }
      });
      return response.data;
    } catch (error) {
      console.error('Get integrations error:', error);
      throw error;
    }
  },

  // Disconnect an email integration
  async disconnectIntegration(integrationId) {
    try {
      const response = await api.post(`/integrations/${integrationId}/disconnect`);
      return response.data;
    } catch (error) {
      console.error('Disconnect integration error:', error);
      throw error;
    }
  },

  // Get integration status
  async getIntegrationStatus(integrationId) {
    try {
      const response = await api.get(`/integrations/${integrationId}/status`);
      return response.data;
    } catch (error) {
      console.error('Get integration status error:', error);
      throw error;
    }
  },

  // Get processed emails for an integration
  async getProcessedEmails(integrationId, params = {}) {
    try {
      const response = await api.get(`/integrations/${integrationId}/emails`, { params });
      return response.data;
    } catch (error) {
      console.error('Get processed emails error:', error);
      throw error;
    }
  },

  // Manually trigger email scan
  async triggerEmailScan(integrationId) {
    try {
      const response = await api.post(`/integrations/${integrationId}/scan`);
      return response.data;
    } catch (error) {
      console.error('Trigger scan error:', error);
      throw error;
    }
  },

  // Update integration settings
  async updateIntegrationSettings(integrationId, settings) {
    try {
      const response = await api.put(`/integrations/${integrationId}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  }
};

export default integrationsService;