import api from './api';

export const integrationsService = {
  // Connect integrations
  async connectIntegration(type, provider, data) {
    try {
      const response = await api.post('/integrations/connect', {
        type,
        provider,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Integration connection error:', error);
      throw error;
    }
  },

  // Legacy Gmail connection support
  async connectGmail(code) {
    try {
      const response = await api.post('/integrations/gmail/connect', { code });
      return response.data;
    } catch (error) {
      console.error('Gmail connection error:', error);
      throw error;
    }
  },

  // Get all integrations with optional type filter
  async getIntegrations(type = null) {
    try {
      const params = {};
      if (type) {
        params.type = type;
      }
      
      const response = await api.get('/integrations', { params });
      return response.data;
    } catch (error) {
      console.error('Get integrations error:', error);
      throw error;
    }
  },

  // Get email integrations (convenience method)
  async getEmailIntegrations() {
    return this.getIntegrations('email');
  },

  // Disconnect an integration
  async disconnectIntegration(integrationId) {
    try {
      const response = await api.post(`/integrations/${integrationId}/disconnect`);
      return response.data;
    } catch (error) {
      console.error('Disconnect integration error:', error);
      throw error;
    }
  },

  // Sync an integration
  async syncIntegration(integrationId) {
    try {
      const response = await api.post(`/integrations/${integrationId}/sync`);
      return response.data;
    } catch (error) {
      console.error('Integration sync error:', error);
      throw error;
    }
  },

  // Get integration details
  async getIntegrationDetails(integrationId) {
    try {
      const response = await api.get(`/integrations/${integrationId}`);
      return response.data;
    } catch (error) {
      console.error('Get integration details error:', error);
      throw error;
    }
  },

  // Update integration settings
  async updateIntegrationSettings(integrationId, settings) {
    try {
      const response = await api.patch(`/integrations/${integrationId}`, {
        settings
      });
      return response.data;
    } catch (error) {
      console.error('Update integration settings error:', error);
      throw error;
    }
  },

  // Helper method to check if an integration is active
  async checkIntegrationStatus(integrationId) {
    try {
      const integration = await this.getIntegrationDetails(integrationId);
      return {
        isActive: integration.status === 'active',
        status: integration.status,
        lastSyncTime: integration.lastSyncTime,
        lastError: integration.lastError
      };
    } catch (error) {
      console.error('Check integration status error:', error);
      throw error;
    }
  }
};

export default integrationsService;