import React, { createContext, useContext, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initializePaddle } from '../utils/paddle';
import PricingCard from './PricingCard';
import { upgradeEvents } from '../utils/events';

const PricingModal = ({ isOpen, onClose }) => {
  const { organization, updateSubscription } = useAuth();
  const currentPlan = organization?.plan || '';

  useEffect(() => {
    const unsubscribe = upgradeEvents.subscribe(() => {
      console.log('Upgrade event received in PricingModal');
      onClose();
    });

    initializePaddle(updateSubscription).then(() => {
      console.log('Paddle initialized');
    }).catch(error => {
      console.error('Paddle initialization failed:', error);
    });

    return () => {
      unsubscribe();
    };
  }, [updateSubscription, onClose]);

  if (!isOpen) return null;

  const plans = [
    {
      title: 'Individual',
      price: 19,
      features: [
        '1 active job posting',
        'Up to 10 candidates per job',
        'Basic job listing',
        'Email notifications'
      ],
      priceId: process.env.REACT_APP_PADDLE_INDIVIDUAL_PRICE_ID,
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
      priceId: process.env.REACT_APP_PADDLE_PRO_PRICE_ID,
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
      priceId: process.env.REACT_APP_PADDLE_ENTERPRISE_PRICE_ID
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
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