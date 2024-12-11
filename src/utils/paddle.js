// src/utils/paddle.js
import { getPaddleInstance, initializePaddle as paddleInit } from '@paddle/paddle-js';
import { upgradeEvents } from '../utils/events';

export const openCancellationModal = async (subscriptionId) => {
  try {
    const paddle = getPaddleInstance();
    await paddle.Checkout.open({
      subscriptionId: subscriptionId,
      action: 'cancel-subscription',
      successCallback: (data) => {
        console.log('Cancellation successful:', data);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error opening cancellation modal:', error);
    throw error;
  }
};

export const initializePaddle = async (updateSubscription) => {
  try {
    await paddleInit({
      environment: 'sandbox',
      seller: parseInt(process.env.REACT_APP_PADDLE_VENDOR_ID, 10),
      eventCallback: async (event) => {
        console.log('Paddle event received:', event.name);
        
        if (event.name === "checkout.completed") {
          console.log('Checkout completed event received', event.data);
          try {
            const orgId = event.data.custom_data?.organization_id;
            
            if (!orgId) {
              console.error('No organization ID found in custom data', event.data);
              return;
            }

            // Determine plan based on the product ID
            const planId = event.data.items[0].product.id;
            let plan;
            if (planId === process.env.REACT_APP_PADDLE_PRO_PLAN_ID) {
              plan = 'pro';
            } else if (planId === process.env.REACT_APP_PADDLE_ENTERPRISE_PLAN_ID) {
              plan = 'enterprise';
            } else {
              plan = 'individual';
            }

            // Only update the UI state
            const subscriptionData = {
              plan: plan,
              status: event.data.status,
              billing: {
                interval: event.data.items[0].billing_cycle.interval,
                amount: event.data.recurring_totals.total
              }
            };

            // Update the subscription in AuthContext
            updateSubscription(subscriptionData);

            // Emit the upgrade event for any UI updates
            upgradeEvents.emit();
            
          } catch (error) {
            console.error('Error processing checkout completion:', error);
          }
        }
      }
    });
    
    return getPaddleInstance();
  } catch (error) {
    console.error('Failed to initialize Paddle:', error);
    throw error;
  }
};