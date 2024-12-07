import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { organizationService } from '../services/organizationService';

const ThankYou = () => {
  const { user, organization, updateSubscription } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const updateSubscriptionStatus = async () => {
      try {
        const checkoutId = searchParams.get('checkout_id');
        const customerId = searchParams.get('customer_id');
        const amount = searchParams.get('amount');
        const billingInterval = searchParams.get('billing_interval');
        const billingAmount = searchParams.get('billing_amount');
        
        if (!checkoutId || !organization?.id) {
          console.error('Missing checkout ID or organization ID');
          return;
        }

        const subscriptionData = {
          checkoutId,
          customerId,
          status: 'active',
          plan: 'professional',
          amount: parseFloat(amount),
          billing: {
            interval: billingInterval,
            amount: parseFloat(billingAmount)
          },
          updatedAt: new Date().toISOString()
        };

        // Update subscription in your backend
        const response = await organizationService.updateUpgrade(
          organization.id,
          subscriptionData
        );

        // Update local state if needed
        if (response.subscription) {
          updateSubscription(response.subscription);
        }

        console.log('Subscription updated successfully');
      } catch (error) {
        console.error('Error updating subscription:', error);
        // Handle error - maybe show an error message to user
      }
    };

    if (user && organization) {
      updateSubscriptionStatus();
    }
  }, [user, organization, searchParams, updateSubscription]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Thank You!</h1>
        <p className="mt-2 text-lg text-gray-600">
          Your subscription has been successfully activated.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;