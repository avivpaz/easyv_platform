import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from '../context/AuthContext';
import { creditsService } from '../services/creditsService';

const CheckoutModal = ({ isOpen, onClose, purchaseDetails, onPurchaseComplete }) => {
  const { user, organization } = useAuth();
  const [error, setError] = useState(null);

  if (!isOpen || !purchaseDetails) return null;

  const handleCreateOrder = async (data, actions) => {
    try {
      const orderData = await creditsService.createPayPalOrder({
        price: purchaseDetails.price,
        credits: purchaseDetails.credits,
        organizationId: organization?.id,
        tier: purchaseDetails.tier,
        customerEmail: user?.email || organization?.email
      });
      
      return orderData.id;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  
  const handleApprove = async (data, actions) => {
    try {
      setError(null);
      const orderData = await creditsService.approvePayPalOrder(data.orderID);

      const errorDetail = orderData?.details?.[0];

      if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
        // Recoverable error - restart the payment flow
        return actions.restart();
      } else if (errorDetail) {
        // Non-recoverable error
        throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
      } else {
        // Successful transaction
        console.log("Capture result", orderData);
        // setMessage(`Transaction ${transaction.status}: ${transaction.id}`);
        onPurchaseComplete();
      }
    } catch (err) {
      console.error('Error handling approval:', err);
      setError(`Failed to complete purchase: ${err.message}`);
      throw err;
    }
  };

  const handleError = (err) => {
    console.error('PayPal error:', err);
    if (err.message === 'Detected popup close') {
      // User closed the popup, we can safely ignore this
      return;
    }
    setError('An error occurred. Please try again.');
  };

  const handleCancel = () => {
    console.log('Payment cancelled');
    setError('Payment was cancelled. Please try again if you wish to complete the purchase.');
  };

  const handleShippingChange = () => {
    return true;
  };
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="relative bg-white rounded-xl shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900">Complete Purchase</h3>
            
            <div className="mt-4 space-y-3">
              {/* <div className="flex justify-between text-sm">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{purchaseDetails.tier}</span>
              </div> */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Credits</span>
                <span className="font-medium">{purchaseDetails.credits} CV credits</span>
              </div>
              {/* <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-primary">{purchaseDetails.discount}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">You save</span>
                <span className="font-medium text-emerald-600">${purchaseDetails.savings}</span>
              </div> */}
              <div className="pt-3 flex justify-between border-t">
                <span className="font-medium">Total</span>
                <span className="font-bold">${purchaseDetails.price}</span>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}
            <div className="mt-6">
            <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'pay',
              tagline: false
            }}
            createOrder={handleCreateOrder}
            onApprove={handleApprove}
            onError={handleError}
            onCancel={handleCancel}
            onClick={() => setError(null)}
            onShippingChange={handleShippingChange}
          />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;