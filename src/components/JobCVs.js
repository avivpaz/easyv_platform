import React, { useState, useEffect } from 'react';
import { 
    FileText, AlertCircle, Upload, Grid, List,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { cvService } from '../services/cvService';
import UploadModal from './UploadModal';
import {cvVisibilityService} from '../services/cvVisibilityService'
import CVCard from './CVCard';
import { useAuth } from '../context/AuthContext';
import PricingModal from './PricingModal'

const JobCVs = ({ jobId }) => {
  const [cvData, setCvData] = useState({ locked: [], unlocked: [], stats: { total: 0, unlocked: 0, locked: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlockError, setUnlockError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [expandedCvId, setExpandedCvId] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('pending');
  const { setCredits } = useAuth();

  const fetchCVs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobCVs(jobId);
      setCvData(data || { locked: [], unlocked: [], stats: { total: 0, unlocked: 0, locked: 0 } });
    } catch (err) {
      console.error('Error fetching CVs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, [jobId]);

  const handleUploadSuccess = () => {
    fetchCVs();
  };

  const updateCVStatus = async (cvId, newStatus) => {
    try {
      await cvService.updateCVStatus(cvId, newStatus);
      setCvData(prevData => {
        const updateCV = (cvArray) => 
          cvArray.map(cv => cv._id === cvId ? { ...cv, status: newStatus } : cv);

        return {
          ...prevData,
          locked: updateCV(prevData.locked),
          unlocked: updateCV(prevData.unlocked)
        };
      });
    } catch (error) {
      console.error('Error updating CV status:', error);
      setError('Failed to update CV status');
    }
  };

  const handleUnlock = async (cvId) => {
    try {
      setUnlockError(null);
      const result = await cvVisibilityService.unlockCVs([cvId]);
      if (result.success) {
        setCvData(prevData => {
          const unlockedCV = result.data[0];
          if (!unlockedCV) return prevData;

          return {
            ...prevData,
            locked: prevData.locked.filter(cv => cv._id !== cvId),
            unlocked: [...prevData.unlocked, unlockedCV],
            stats: {
              ...prevData.stats,
              locked: prevData.stats.locked - 1,
              unlocked: prevData.stats.unlocked + 1
            }
          };
        });
        setCredits(result.remainingCredits);
      } else {
        if (result.error?.includes('insufficient_credits')) {
          setShowPricingModal(true);
        } else {
          setUnlockError(result.error);
        }
      }
    } catch (error) {
      if (error.message?.includes('insufficient_credits')) {
        setShowPricingModal(true);
      } else {
        setUnlockError(error.message);
      }
    }
  };
  
  const handleNext = () => {
    const filteredCVs = getAllCVs();
    if (currentIndex < filteredCVs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getAllCVs = () => {
    const allCVs = [...cvData.unlocked, ...cvData.locked];
    return allCVs.filter(cv => cv.status === activeTab);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
          <p>{error}</p>
        </div>
      );
    }

    if (cvData.stats.total === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No CVs found</h3>
          <p className="text-sm text-gray-500">Upload some CVs to get started!</p>
        </div>
      );
    }

    const filteredCVs = getAllCVs();

    if (isReviewMode) {
      return (
        <CVCard 
          cv={filteredCVs[currentIndex]}
          isReviewMode={true}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentIndex={currentIndex}
          total={filteredCVs.length}
          updateCVStatus={updateCVStatus}
          onUnlock={handleUnlock}
        />
      );
    }

    return (
      <>
        {filteredCVs.map(cv => (
          <CVCard 
            key={cv._id} 
            cv={cv} 
            isExpanded={expandedCvId === cv._id}
            onToggle={() => setExpandedCvId(expandedCvId === cv._id ? null : cv._id)}
            updateCVStatus={updateCVStatus}
            onUnlock={handleUnlock}
            showStatusButtons={true}
            currentStatus={cv.status}
          />
        ))}
      </>
    );
  };

  return (
    <div>
      {/* Tabs Container */}
      <div className="mb-6 overflow-x-auto">
        <div className="border-b border-gray-200 min-w-full">
          <nav className="flex" aria-label="Tabs">
            {['pending', 'approved', 'rejected'].map((status) => {
              const count = [...cvData.unlocked, ...cvData.locked].filter(cv => cv.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`
                    whitespace-nowrap py-4 px-3 flex-1 border-b-2 font-medium text-sm flex items-center justify-center gap-2
                    ${activeTab === status
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className={`
                    rounded-full px-2 py-0.5 text-xs font-medium min-w-[1.5rem] text-center
                    ${activeTab === status
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Actions Container */}
      <div className="mb-4 flex items-center justify-between">
        {/* Review Mode Toggle */}
        <button
          onClick={() => setIsReviewMode(!isReviewMode)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          {isReviewMode ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          <span>{isReviewMode ? 'Grid View' : 'Review Mode'}</span>
        </button>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark"
        >
          <Upload className="h-4 w-4" />
          <span>Upload CVs</span>
        </button>
      </div>

      {unlockError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{unlockError}</p>
        </div>
      )}

      <div className="space-y-4 relative group">
        {/* Floating Navigation Controls */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-10">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200
              p-2 rounded-full bg-white shadow-lg border border-gray-200 
              ${currentIndex === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-50'
              } transform -translate-x-1/2`}
            style={{ zIndex: 20 }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex >= getAllCVs().length - 1}
            className={`pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200
              p-2 rounded-full bg-white shadow-lg border border-gray-200
              ${currentIndex >= getAllCVs().length - 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-50'
              } transform translate-x-1/2`}
            style={{ zIndex: 20 }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {renderContent()}
      </div>

      {showUploadModal && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          jobId={jobId}
          onSuccess={handleUploadSuccess}
        />
      )}

      <PricingModal 
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onPurchaseComplete={() => {
          setShowPricingModal(false);
        }}
      />
    </div>
  );
};

export default JobCVs;