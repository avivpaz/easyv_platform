import React, { useState } from 'react';
import CheckoutModal from './CheckoutModal';
const PricingCard = ({ 
  title, 
  credits,
  exactPrice,
  savings,
  discount, 
  isPopular,
  onClose,
  onPurchaseComplete
}) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handlePurchase = () => {
    setIsCheckoutOpen(true);
  };

  const handlePurchaseSuccess = () => {
    onPurchaseComplete(credits);
  };

  return (
    <div 
      className={`relative bg-white rounded-2xl h-full ${
        isPopular ? 'border-2 border-primary' : 'border border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="p-7 flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="text-2xl font-semibold text-gray-900">{credits} Credits</h3>
          
          <div className="mt-6 flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">
              ${(exactPrice/credits).toFixed(2)}
            </span>
            <span className="text-gray-600 ml-2">/cv</span>
          </div>

          {/* <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700">
              Save {discount}% on credits
            </span>
          </div> */}
        </div>
        
        <button
          onClick={handlePurchase}
          className="mt-8 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:opacity-90 transition-colors"
        >
          Purchase Credits
        </button>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={onClose}
        onPurchaseComplete={handlePurchaseSuccess}
        purchaseDetails={{
          tier: title,
          credits,
          price: exactPrice,
          discount,
          savings
        }}
      />
    </div>
  );
};

export default PricingCard;