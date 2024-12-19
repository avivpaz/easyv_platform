import { getPaddleInstance, initializePaddle as paddleInit } from '@paddle/paddle-js';

export const initializePaddle = async (addCredits,onPurchaseComplete) => {
  try {
    await paddleInit({
      environment: process.env.NODE_ENV === 'production' ? 'sandbox' : 'sandbox',
      seller: parseInt(process.env.REACT_APP_PADDLE_VENDOR_ID, 10),
      eventCallback: async (event) => {
        console.log('Paddle event received:', event.name);
        
        if (event.name === "checkout.completed") {
          console.log('Transaction completed event received', event.data);
          try {
            // Access credits from customData properly
            const customData = event.data.customData || event.data.custom_data;
            console.log('Custom data received:', customData);
            
            if (!customData || !customData.credits) {
              console.error('Missing credits in custom data', customData);
              return;
            }

            // Add credits to organization
            addCredits({
              credits: parseInt(customData.credits)
            });
            onPurchaseComplete()
            // Emit the upgrade event for any UI updates
            
          } catch (error) {
            console.error('Error updating credits display:', error);
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