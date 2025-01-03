import React from 'react';
import { CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CreditsDisplay = ({ onPurchaseClick }) => {
  const { organization } = useAuth();
  const credits = organization?.credits || 0;

  return (
    <div className="relative group inline-block">
      <div 
        onClick={onPurchaseClick}
        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
      >
        <CreditCard className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-gray-700">
          {credits} Credits
        </span>
      </div>
    </div>
  );
};

export default CreditsDisplay;