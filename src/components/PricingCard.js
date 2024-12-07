import { getPaddleInstance } from '@paddle/paddle-js';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';

const PricingCard = ({ title, price, features, isPopular, priceId, currentPlan }) => {
  const { user, organization } = useAuth();
  const isCurrentPlan = currentPlan === title.toLowerCase();
  
  const handleCheckout = async (e) => {
    e.preventDefault();
    
    try {
      if (price === 0) {
        return;
      }
  
      const paddle = getPaddleInstance();
      const checkoutData = {
        items: [{
          priceId: priceId,
          quantity: 1
        }],
        customer: {email: user?.email || organization?.email},
        customData: {
          organizationId: organization.id
        }
      };
  
      const checkout = await paddle.Checkout.open(checkoutData);
      console.log('Checkout opened:', checkout);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <div className={`relative bg-white rounded-2xl h-full ${isPopular ? 'border-2 border-primary' : 'border border-gray-200'}`}>
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
        </div>
        
        {isCurrentPlan ? (
          <button 
            disabled 
            className="mt-6 w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg font-medium text-sm"
          >
            Current Plan
          </button>
        ) : (
          <button
            onClick={handleCheckout}
            className={`mt-6 w-full text-center py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              price === 0 
                ? 'bg-primary text-white hover:bg-primary-light'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90'
            }`}
          >
            {price === 0 ? 'Get Started' : 'Upgrade Now'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PricingCard;