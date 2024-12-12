// components/PricingModal.js
import React,{useEffect} from 'react';
import { X } from 'lucide-react';
import { initializePaddle } from '../utils/paddle';
import PricingCard from './PricingCard'
import { useAuth } from '../context/AuthContext';

const PricingModal = ({ isOpen, onClose, onPurchaseComplete }) => {
  const { user, organization,addCredits } = useAuth();

  const plans = [
    {
      title: 'Tier 1',
      credits: 10,
      exactPrice: '45.00',
      savings: '5.00',
      discount: 10,
      features: [
        '10 CV processing credits',
        '10% discount applied',
        'Basic candidate screening',
        'Email notifications',
        '30-day credit validity'
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
        '25 CV processing credits',
        '15% discount applied',
        'Advanced candidate screening',
        'Priority support',
        '60-day credit validity'
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
        '50 CV processing credits',
        '20% discount applied',
        'Premium candidate screening',
        'Dedicated account manager',
        '90-day credit validity'
      ],
      priceId: process.env.REACT_APP_PADDLE_TIER3_PRICE_ID
    }
  ];
 

  const handlePurchase = async (planDetails) => {
    try {
      const paddle =await initializePaddle(addCredits);
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
        customer: {email: user?.email || organization?.email},        
      };

      const checkout = await paddle.Checkout.open(checkoutData);
      console.log('Checkout opened:', checkout);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 text-center">
        <span 
          className="inline-block h-screen align-middle" 
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div 
          className="inline-block w-full max-w-[900px] p-6 my-8 text-left align-middle bg-white shadow-xl rounded-2xl transform transition-all"
          onClick={e => e.stopPropagation()}
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-0 top-0 text-gray-400 hover:text-gray-500 transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Purchase CV Credits
              </h2>
              <p className="mt-2 text-gray-600">
                Starting at $5 per CV credit
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.title}
                  {...plan}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
