// components/PricingModal.js
import React from 'react';
import { X } from 'lucide-react';
import { initializePaddle } from '../utils/paddle';
import PricingCard from './PricingCard'
import { useAuth } from '../context/AuthContext';

const PricingModal = ({ isOpen, onClose, onPurchaseComplete }) => {
  const { user, organization, addCredits } = useAuth();

  const plans = [
    {
      title: 'Tier 1',
      credits: 10,
      exactPrice: '45.00',
      savings: '5.00',
      discount: 10,
      features: [
        '10 CVs for the price of 9',
        '10% volume discount applied'
      ],
      priceId: process.env.REACT_APP_PADDLE_TIER1_PRICE_ID
    },
    {
      title: 'Tier 2',
      credits: 25,
      exactPrice: '105.00',
      savings: '20.00',
      discount: 15,
      features: [
        '25 CVs for the price of 21',
        '15% volume discount applied',
      ],
      priceId: process.env.REACT_APP_PADDLE_TIER2_PRICE_ID,
      isPopular: true
    },
    {
      title: 'Tier 3',
      credits: 50,
      exactPrice: '200.00',
      savings: '50.00',
      discount: 20,
      features: [
        '50 CVs for the price of 40',
        '20% volume discount applied',
      ],
      priceId: process.env.REACT_APP_PADDLE_TIER3_PRICE_ID
    }
  ];

  const handlePurchase = async (planDetails) => {
    try {
      const paddle = await initializePaddle(addCredits, onPurchaseComplete);
      const checkoutData = {
        items: [{
          priceId: plans.find(p => p.title === planDetails.tier).priceId,
          quantity: 1
        }],
        customData: {
          credits: planDetails.credits,
          price: planDetails.price,
          discount: planDetails.discount,
          savings: planDetails.savings,
          organizationId: organization.id,
        },
        customer: { email: user?.email || organization?.email },
      };

      const checkout = await paddle.Checkout.open(checkoutData);
      console.log('Checkout opened:', checkout);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto overscroll-contain">
      <div className="min-h-screen w-full px-4 py-6 sm:py-8">
        <div 
          className="relative w-full max-w-[900px] mx-auto bg-white shadow-xl rounded-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button - Fixed position on mobile */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 sm:right-4 sm:top-4 text-gray-400 hover:text-gray-500 transition-colors p-2 bg-white rounded-full shadow-sm z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Purchase CV Credits
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Starting at $5 per CV credit
              </p>
            </div>
            
            {/* Cards Container - Improved scrolling on mobile */}
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {plans.map((plan, index) => (
                <div 
                  key={plan.title}
                  className={`${
                    plan.isPopular 
                      ? 'order-first sm:order-none sm:transform sm:scale-105 sm:z-10' 
                      : ''
                  }`}
                >
                  <PricingCard
                    {...plan}
                    onPurchase={handlePurchase}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Message - Optional */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Need more credits? Contact our sales team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;