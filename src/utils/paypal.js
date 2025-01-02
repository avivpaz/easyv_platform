// utils/paypal.js
import { loadScript } from "@paypal/paypal-js";

let paypalInstance = null;

export const initializePayPal = async () => {
  try {
    if (paypalInstance) {
      return paypalInstance;
    }

    const clientId = process.env.REACT_APP_PAYPAL_SANDBOX_CLIENT_ID;
    if (!clientId) {
      throw new Error('PayPal sandbox client ID is not configured');
    }

    paypalInstance = await loadScript({
      "client-id": clientId,
      currency: "USD",
      intent: "capture",
      environment: "sandbox"
    });
    
    console.log('PayPal SDK loaded in sandbox mode');
    return paypalInstance;
  } catch (error) {
    console.error('PayPal initialization error:', error);
    throw error;
  }
};

export const createPayPalCheckout = async (
  price,
  customData,
  customerEmail,
  addCredits,
  onPurchaseComplete,
  container,
  buttonOptions = {}
) => {
  try {
    // Initialize PayPal if not already done
    if (!paypalInstance) {
      paypalInstance = await initializePayPal();
    }

    // Validate price format
    const formattedPrice = typeof price === 'string' ? price : price.toFixed(2);

    const buttons = paypalInstance.Buttons({
      style: {
        color: 'blue',
        shape: 'rect',
        layout: 'horizontal',
        height: 40,
        ...buttonOptions.style
      },
      createOrder: async () => {
        try {
          const response = await fetch('/api/create-paypal-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              price: formattedPrice,
              customData: customData,
              customerEmail: customerEmail
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create order');
          }

          const orderData = await response.json();
          if (!orderData.id) {
            throw new Error('Invalid order response');
          }
          return orderData.id;
        } catch (err) {
          console.error('Error creating PayPal order:', err);
          throw err;
        }
      },
      onApprove: async (data) => {
        try {
          if (onPurchaseComplete) {
            onPurchaseComplete();
          }
          
          return {
            status: 'PENDING_WEBHOOK',
            message: 'Payment approved! Processing your order...'
          };
        } catch (err) {
          console.error('Error handling PayPal approval:', err);
          throw err;
        }
      },
      onCancel: (data) => {
        console.log('PayPal order cancelled:', data);
      },
      onError: (err) => {
        console.error('PayPal Buttons Error:', err);
      }
    });

    // Verify container exists
    if (!container) {
      throw new Error('PayPal button container not found');
    }

    await buttons.render(container);
    console.log('PayPal buttons rendered successfully');
  } catch (error) {
    console.error('Error creating PayPal checkout:', error);
    throw error;
  }
};