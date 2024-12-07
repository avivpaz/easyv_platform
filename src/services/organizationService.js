// services/organizationService.js
import api from './api';

export const organizationService = {
  async updateOrganization(organizationId, formData) {
    try {
      const response = await api.put(`/organizations/${organizationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update Organization Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw new Error(error.response?.data?.error || 'Failed to update organization');
    }
  },

  async getOrganization(organizationId) {
    try {
      const response = await api.get(`/organizations/${organizationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch organization');
    }
  },

  async updateLogo(organizationId, logoFile) {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await api.put(`/organizations/${organizationId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update Logo Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating logo:', error);
      throw new Error(error.response?.data?.error || 'Failed to update logo');
    }
  },

  async updateUpgrade(organizationId, subscriptionData) {
    try {
      const response = await api.put(`/organizations/${organizationId}/upgrade`, {
        checkoutId: subscriptionData.checkoutId,
        customerId: subscriptionData.customerId,
        status: subscriptionData.status,
        plan: subscriptionData.plan,
        amount: subscriptionData.amount,
        billing: {
          interval: subscriptionData.billing.interval,
          amount: subscriptionData.billing.amount
        },
        updatedAt: new Date().toISOString()
      });
  
      console.log('Update Subscription Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error(error.response?.data?.error || 'Failed to update subscription');
    }
  },
  async deleteLogo(organizationId) {
    try {
      const response = await api.delete(`/organizations/${organizationId}/logo`);
      console.log('Delete Logo Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error deleting logo:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete logo');
    }
  },

  async updateSocialLinks(organizationId, socialLinks) {
    try {
      const response = await api.put(`/organizations/${organizationId}/social`, socialLinks);
      console.log('Update Social Links Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating social links:', error);
      throw new Error(error.response?.data?.error || 'Failed to update social links');
    }
  },

  async updateDescription(organizationId, description) {
    try {
      const response = await api.put(`/organizations/${organizationId}/description`, { description });
      console.log('Update Description Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error updating description:', error);
      throw new Error(error.response?.data?.error || 'Failed to update description');
    }
  }
};