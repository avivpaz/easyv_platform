import React, { useState } from 'react';
import CheckoutModal from './CheckoutModal';

const PricingCard = ({ 
  title, 
  credits,
  exactPrice,
  savings,
  discount, 
  features, 
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
      
      <div className="p-6 flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="mt-4 space-y-2">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">${exactPrice}</span>
              <span className="text-gray-500 ml-2">total</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{credits} CV credits</div>
              <div className="text-primary font-medium">{discount}% discount</div>
              <div className="text-emerald-600 font-medium">Save ${savings}</div>
            </div>
          </div>
          
          <ul className="mt-6 space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <svg 
                  className="w-4 h-4 text-primary flex-shrink-0" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                <span className="text-sm text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <button
          onClick={handlePurchase}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:opacity-90 transition-colors"
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