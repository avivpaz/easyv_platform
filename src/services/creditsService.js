// services/creditsService.js
import api from './api';

export const creditsService = {
  async purchaseCredits(organizationId, creditData) {
    try {
      const response = await api.post(`/billing/credits/${organizationId}`, {
        amount: creditData.amount,
        credits: creditData.credits,
        tier: creditData.tier,
        transactionId: creditData.transactionId,
        customerId: creditData.customerId
      });
      return response.data;
    } catch (error) {
      console.error('Error purchasing credits:', error);
      throw new Error(error.response?.data?.error || 'Failed to purchase credits');
    }
  },
  

  async getTransactions(organizationId) {
    try {
      const response = await api.get(`/billing/transactions/${organizationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch transactions');
    }
  },

  async getCurrentCredits(organizationId) {
    try {
      const response = await api.get(`/billing/credits/${organizationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching credits:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch credits');
    }
  },
  async createPayPalOrder(orderData) {
    try {
      const response = await api.post('/billing/create-paypal-order', {
        price: orderData.price,
        customData: {
          credits: orderData.credits,
          organizationId: orderData.organizationId,
          tier: orderData.tier
        },
        customerEmail: orderData.customerEmail
      });
      return response.data;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw new Error(error.response?.data?.error || 'Failed to create PayPal order');
    }
  },
  async approvePayPalOrder(orderId) {
    try {
      const response = await api.post(`/billing/approve-paypal-order`, {
        orderId:orderId
      });
      return response.data;
    } catch (error) {
      console.error('Error approving PayPal order:', error);
      throw new Error(error.response?.data?.error || 'Failed to approve PayPal order');
    }
  },
};