import React, { useState, useEffect } from 'react';
import { 
    FileText, AlertCircle, Clock, Upload, GraduationCap, 
    Briefcase, ChevronRight, ChevronLeft, Code, Filter,
    Link, X, Lock, Users, Grid, List, ChevronDown,
    ChevronUp, ThumbsUp, ThumbsDown, Unlock
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { cvService } from '../services/cvService';
import UploadModal from './UploadModal';
import {cvVisibilityService} from '../services/cvVisibilityService'
import CVCard from './CVCard';  // Import the unified CVCard component
import { useAuth } from '../context/AuthContext';




const JobCVs = ({ jobId }) => {
  const [cvData, setCvData] = useState({ locked: [], unlocked: [], stats: { total: 0, unlocked: 0, locked: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlockError, setUnlockError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedCvId, setExpandedCvId] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState(['pending']); // Add filters state
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
          // Use the returned CV data from the API
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
        setUnlockError(result.error);
      }
    } catch (error) {
      setUnlockError(error.message);
    }
  };
  
  const handleNext = () => {
    const totalCVs = cvData.unlocked.length + cvData.locked.length;
    if (currentIndex < totalCVs - 1) {
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
    // Filter CVs based on selected status filters
    return filters.includes('all') 
      ? allCVs 
      : allCVs.filter(cv => filters.includes(cv.status));
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
          />
        ))}
      </>
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Status Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {['pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    if (status === 'all') {
                      setFilters(['all']);
                    } else {
                      setFilters(prev => {
                        if (prev.includes(status)) {
                          const newFilters = prev.filter(f => f !== status);
                          return newFilters.length ? newFilters : ['pending'];
                        }
                        return prev.includes('all') ? [status] : [...prev, status];
                      });
                    }
                  }}
                  className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium border transition-colors ${
                    filters.includes(status)
                      ? 'bg-primary/5 border-primary/20 text-primary'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Review Mode Toggle */}
          <button
            onClick={() => setIsReviewMode(!isReviewMode)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            {isReviewMode ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            <span>{isReviewMode ? 'Grid View' : 'Review Mode'}</span>
          </button>
        </div>

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

      <div className="space-y-4">
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
    </div>
  );
};

export default JobCVs;