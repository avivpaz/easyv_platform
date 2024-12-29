// utils/lemonsqueezy.js
import { lemonSqueezySetup, createCheckout as lemonSqueezyCreateCheckout } from '@lemonsqueezy/lemonsqueezy.js';

export const initializeLemonSqueezy = async () => {
  try {
    // Initialize LemonSqueezy with your API key
    lemonSqueezySetup({ apiKey: process.env.REACT_APP_LEMONSQUEEZY_API_KEY });
    
    // Add LemonSqueezy checkout.js script if it hasn't been added yet
    if (!document.getElementById('lemonsqueezy-js')) {
      const script = document.createElement('script');
      script.id = 'lemonsqueezy-js';
      script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
      script.async = true;
      document.head.appendChild(script);
    }
  } catch (error) {
    console.error('Failed to initialize LemonSqueezy:', error);
    throw error;
  }
};

export const createCheckout = async (storeId, variantId, customData, customerEmail, addCredits, onPurchaseComplete) => {
  try {
    window.LemonSqueezy.Setup({
      eventHandler: async (event) => {
        if (event.event === 'Checkout.Success') {
          console.log('Checkout success:', event);
          
          try {
            const customData = event.data.order.meta.custom_data;
            
            if (!customData || !customData.credits) {
              console.error('Missing credits in custom data', customData);
              return;
            }

            // Add credits to organization
            await addCredits({
              credits: parseInt(customData.credits)
            });
            
            // Call onPurchaseComplete callback
            onPurchaseComplete();
            
          } catch (error) {
            console.error('Error processing LemonSqueezy checkout:', error);
          }
        }
      }
    });

    const currentUrl = window.location.href;

    const checkoutCustomData = {
        ...customData,
        credits: customData.credits.toString() // Ensure credits is a string
      };
    // Get the checkout URL from the API
    const checkoutResponse = await lemonSqueezyCreateCheckout(
      storeId,
      variantId,
      {
        checkoutData: {
          email: customerEmail,
          custom:checkoutCustomData
        },
        testMode: true,
        productOptions: {
          redirectUrl: currentUrl
        },
        checkoutOptions: {
          embed: true
        }
      }
    );
    
    // Extract the checkout URL from the response
    const checkoutUrl = checkoutResponse.data.data.attributes.url;
    
    // Open the checkout in a new window
    window.LemonSqueezy.Url.Open(checkoutUrl);
    
    return checkoutResponse;
  } catch (error) {
    console.error('Failed to create checkout:', error);
    throw error;
  }
};