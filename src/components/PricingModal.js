import React from 'react';
import { Crown, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PricingCard = ({ title, price, features, isPopular, checkoutUrl, currentPlan }) => {
  const isCurrentPlan = currentPlan === title.toLowerCase();
  
  return (
    <div className={`relative bg-white rounded-2xl ${isPopular ? 'border-2 border-primary' : 'border border-gray-200'}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="mt-4">
          <span className="text-3xl font-bold">${price}</span>
          {price > 0 && <span className="text-gray-500">/month</span>}
        </div>
        
        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        
        {isCurrentPlan ? (
          <button 
            disabled 
            className="mt-6 w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg font-medium text-sm"
          >
            Current Plan
          </button>
        ) : (
          <a
            href={checkoutUrl}
            className={`mt-6 block w-full text-center py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              price === 0 
                ? 'bg-primary text-white hover:bg-primary-light'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90'
            }`}
          >
            {price === 0 ? 'Get Started' : 'Upgrade Now'}
          </a>
        )}
      </div>
    </div>
  );
};

const PricingModal = ({ isOpen, onClose }) => {
  const { organization } = useAuth();
  const currentPlan = organization?.plan || 'free';

  if (!isOpen) return null;

  const plans = [
    {
      title: 'Free',
      price: 0,
      features: [
        '1 active job posting',
        'Up to 10 candidates per job',
        'Basic job listing',
        'Email notifications'
      ],
      checkoutUrl: '#',
    },
    {
      title: 'Professional',
      price: 49,
      features: [
        'Up to 3 active job postings',
        'Unlimited candidates',
        'Featured job listings',
        'Advanced analytics',
        'Email & SMS notifications'
      ],
      checkoutUrl: `${process.env.REACT_APP_API_URL}/subscription/checkout/professional`,
      isPopular: true
    },
    {
      title: 'Enterprise',
      price: 99,
      features: [
        'Unlimited job postings',
        'Unlimited candidates',
        'Priority job listings',
        'Advanced analytics & reports',
        'Dedicated support',
        'Custom integrations'
      ],
      checkoutUrl: `${process.env.REACT_APP_API_URL}/subscription/checkout/enterprise`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen px-4 text-center">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        {/* This element centers the modal contents */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div 
          className="inline-block w-full max-w-[900px] p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-0 top-0 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
              <p className="mt-2 text-gray-600">
                Select the perfect plan for your recruitment needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.title}
                  {...plan}
                  currentPlan={currentPlan}
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