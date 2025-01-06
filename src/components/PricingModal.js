import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from './CheckoutModal';

const PricingModal = ({ isOpen, onClose }) => {
  const { addCredits } = useAuth();
  const [selected, setSelected] = useState('25');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      credits: '10',
      exactPrice: '45.00',
      perCredit: '4.50',
      savings: '5.00',
      discount: 10
    },
    {
      credits: '25',
      exactPrice: '105.00',
      perCredit: '4.20',
      savings: '20.00',
      discount: 15,
      isPopular: true
    },
    {
      credits: '50',
      exactPrice: '200.00',
      perCredit: '4.00',
      savings: '50.00',
      discount: 20
    }
  ];

  const selectedPlan = plans.find(p => p.credits === selected);

  const handleContinue = () => {
    setIsCheckoutOpen(true);
  };

  const handlePurchaseComplete = (credits) => {
    addCredits(credits);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto">
      <div className="min-h-screen w-full px-4 py-6 sm:py-8">
        <div className="relative w-full max-w-[600px] mx-auto bg-white shadow-xl rounded-2xl">
          <button
            onClick={onClose}
            className="absolute right-2 top-2 sm:right-4 sm:top-4 text-gray-400 hover:text-gray-500 transition-colors p-2 bg-white rounded-full shadow-sm z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Purchase CV Credits
              </h2>
              <p className="mt-2 text-gray-600">
                Each credit allows you to process one CV through our AI system
              </p>
            </div>
            
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.credits}
                  className={`relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all ${
                    selected === plan.credits 
                      ? 'border-purple-600 bg-purple-50/50' 
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                  onClick={() => setSelected(plan.credits)}
                >
                  <input
                    type="radio"
                    name="pricing-plan"
                    value={plan.credits}
                    checked={selected === plan.credits}
                    onChange={() => setSelected(plan.credits)}
                    className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-600"
                  />
                  
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {plan.credits} Credits
                        </span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm text-gray-600">${plan.perCredit}/cv</span>
                          <span className="text-xs text-emerald-600 font-medium">Save {plan.discount}%</span>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${plan.exactPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={handleContinue}
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3.5 px-4 rounded-xl font-medium hover:opacity-90 transition-colors"
              >
                Continue to Payment
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Need more than 50 credits? {' '}
                <a 
                  href="mailto:sales@rightcruiter.com" 
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Contact our sales team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
        purchaseDetails={{
          credits: selectedPlan?.credits,
          price: selectedPlan?.exactPrice,
          discount: selectedPlan?.discount,
          savings: selectedPlan?.savings
        }}
      />
    </div>
  );
};

export default PricingModal;