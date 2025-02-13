import { CheckCircle, X, ExternalLink, Share2 } from 'lucide-react';

const JobCreatedModal = ({ isOpen, onClose, job, onShare, onViewAsCandidate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
        
        {/* Center content */}
        <span className="inline-block h-screen align-middle">&#8203;</span>
        
        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-xl relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 mx-auto flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Job Created Successfully!
            </h3>
            
            <p className="mt-2 text-gray-600">
              Your job listing for "{job?.title}" has been created. What would you like to do next?
            </p>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={onViewAsCandidate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View Job Page
              </button>
              
              <button
                onClick={onShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCreatedModal; 