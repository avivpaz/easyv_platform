import { CheckCircle, X } from 'lucide-react';

export const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose}
        />
        
        {/* Center content */}
        <span className="inline-block h-screen align-middle">&#8203;</span>
        
        {/* Modal */}
        <div className="inline-block w-full max-w-sm p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Thank You!
            </h3>
            
            <p className="mt-2 text-gray-600">
              Your subscription has been successfully activated. You now have access to all professional features.
            </p>
            
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};