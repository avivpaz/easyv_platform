import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PricingCard from './PricingCard';

const PricingModal = ({ isOpen, onClose }) => {
  const { user, organization,addCredits } = useAuth();

  if (!isOpen) return null;

  const plans = [
    {
      title: 'Starter',
      credits: 10,
      exactPrice: '45.00',
      savings: '5.00',
      discount: 10,
      features: [
        '10 CVs for the price of 9',
        '10% volume discount applied'
      ]
    },
    {
      title: 'Growth',
      credits: 25,
      exactPrice: '105.00',
      savings: '20.00',
      discount: 15,
      features: [
        '25 CVs for the price of 21',
        '15% volume discount applied',
      ],
      isPopular: true
    },
    {
      title: 'Scale',
      credits: 50,
      exactPrice: '200.00',
      savings: '50.00',
      discount: 20,
      features: [
        '50 CVs for the price of 40',
        '20% volume discount applied',
      ]
    }
  ];

  const handlePurchaseComplete = (credits) => {
    addCredits(credits);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto overscroll-contain">
      <div className="min-h-screen w-full px-4 py-6 sm:py-8">
        <div 
          className="relative w-full max-w-[900px] mx-auto bg-gray-50 shadow-xl rounded-2xl"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-2 top-2 sm:right-4 sm:top-4 text-gray-400 hover:text-gray-500 transition-colors p-2 bg-white rounded-full shadow-sm z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Purchase CV Credits
              </h2>
              <p className="mt-2 text-gray-600">
                {user?.email || organization?.name} • Starting at $5 per CV credit
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.title}
                  {...plan}
                  onClose={onClose}
                  onPurchaseComplete={handlePurchaseComplete}
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Need more than 50 credits? {' '}
                <a 
                  href="mailto:sales@example.com" 
                  className="text-primary hover:text-primary/90 font-medium"
                >
                  Contact our sales team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;