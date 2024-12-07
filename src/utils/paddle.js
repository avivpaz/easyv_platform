// src/utils/paddle.js
import { getPaddleInstance, initializePaddle as paddleInit,Paddle } from '@paddle/paddle-js';
import { organizationService } from '../services/organizationService';
import { upgradeEvents } from '../utils/events';


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

        
            // Determine plan based on the price ID
            const planId = event.data.items[0].product.id;
            let plan;
            if (planId === process.env.REACT_APP_PADDLE_PRO_PLAN_ID) {
              plan = 'pro';
            } else if (planId === process.env.REACT_APP_PADDLE_ENTERPRISE_PLAN_ID) {
              plan = 'enterprise';
            } else {
              plan = 'free';
            }

            const subscriptionData = {
              checkoutId: event.data.id,
              customerId: event.data.customer.id,
              status: event.data.status,
              plan: plan,
              amount: event.data.totals.total,
              billing: {
                interval: event.data.items[0].billing_cycle.interval,
                amount: event.data.recurring_totals.total
              },
              updatedAt: new Date().toISOString()
            };

            console.log('Updating subscription with data:', subscriptionData);
            
              // // Update subscription in your backend
              // const response = await organizationService.updateUpgrade(
              //   orgId,
              //   subscriptionData
              // );

              // console.log('Subscription update response:', response);

              // Update the subscription in AuthContext
              if (subscriptionData) {
                updateSubscription(subscriptionData);
              }

              // Emit the upgrade event
              console.log('Emitting upgrade event');
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