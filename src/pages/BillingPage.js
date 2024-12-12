import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Crown, ExternalLink, AlertCircle, Loader } from 'lucide-react';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const BillingPage = () => {
  const { organization, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      setLoading(true);
      // Here you would integrate with your backend to fetch Paddle subscription details
      // This is a placeholder for the actual API call
      const subscriptionData = {
        plan: organization?.subscription?.plan || 'free',
        status: organization?.subscription?.status,
        amount: organization?.subscription?.billing?.amount,
        interval: organization?.subscription?.billing?.interval,
        nextBillingDate: organization?.subscription?.nextBillingDate,
        customerId: organization?.subscription?.customerId
      };
      
      setSubscription(subscriptionData);
      // Fetch invoices from Paddle through your backend
      // This is a placeholder for the actual API call
      const invoicesData = organization?.invoices || [];
      setInvoices(invoicesData);
    } catch (err) {
      console.error('Error fetching billing info:', err);
      setError('Failed to load billing information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      if (!subscription?.customerId) {
        throw new Error('No subscription found');
      }

    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-white">Billing</h1>
          <p className="text-secondary-light mt-1">Manage your subscription and billing information</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <h3 className="font-medium">Error</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Current Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Current Plan</h2>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="font-medium text-gray-900 capitalize">
                    {subscription?.plan || 'Free'} Plan
                  </span>
                </div>
                {subscription?.amount && (
                  <p className="text-gray-600">
                    {formatCurrency(subscription.amount)} / {subscription.interval}
                  </p>
                )}
                {subscription?.nextBillingDate && (
                  <p className="text-gray-600">
                    Next billing date: {formatDate(subscription.nextBillingDate)}
                  </p>
                )}
              </div>
            </div>
            {subscription?.status === 'active' && (
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Cancel plan
              </button>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Powered by Paddle</div>
            </div>
            <button 
              className="mt-4 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors inline-flex items-center gap-2"
              onClick={handleCancelSubscription}
            >
              Update payment method
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Billing History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => window.open(invoice.invoiceUrl, '_blank')}
                        className="text-primary hover:text-primary-dark text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && (
              <p className="text-center py-4 text-gray-500">No invoices found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;