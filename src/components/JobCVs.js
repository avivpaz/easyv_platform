import React, { useState, useEffect } from 'react';
import { 
    FileText, AlertCircle, Upload, Grid, List,
    ChevronLeft, ChevronRight,Search,ChevronFirst,ChevronLast,AlertTriangle
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { cvService } from '../services/cvService';
import UploadModal from './UploadModal';
import {cvVisibilityService} from '../services/cvVisibilityService'
import CVCard from './CVCard';
import { useAuth } from '../context/AuthContext';
import PricingModal from './PricingModal'
import { useSearchParams } from 'react-router-dom';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const { setCredits } = useAuth();
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10
  });
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

  const handlePageChange = (newPage) => {
    // Validate page bounds
    const totalPages = Math.ceil(cvData.stats.total / 10);
    if (newPage < 1 || newPage > totalPages) return;
  
    // Update URL parameters
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  
    // Update current page and fetch data
    setCurrentPage(newPage);
    fetchCVs(newPage);
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
    return allCVs
      .filter(cv => cv.status === activeTab)
      .filter(cv => 
        searchQuery === '' || 
        cv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cv.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gradient-to-br from-red-50 to-red-50/50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">Error Loading CVs</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      );
    }

    const filteredCVs = getAllCVs();

    if (filteredCVs.length === 0) {
      return (
        <div className="text-center py-16 px-6">
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 max-w-lg mx-auto">
            <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-6">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No CVs Found</h3>
            <p className="text-gray-600 leading-relaxed">
              {searchQuery 
                ? "No CVs match your search criteria. Try adjusting your filters or search terms."
                : "Upload some CVs to get started with candidate review."}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload CVs
            </button>
          </div>
        </div>
      );
    }

    if (isReviewMode) {
      return (
        <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm">
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
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredCVs.map(cv => (
          <div 
            key={cv._id} 
            className="transition-all duration-300 transform hover:-translate-y-1"
          >
            <CVCard 
              cv={cv} 
              isExpanded={expandedCvId === cv._id}
              onToggle={() => setExpandedCvId(expandedCvId === cv._id ? null : cv._id)}
              updateCVStatus={updateCVStatus}
              onUnlock={handleUnlock}
              showStatusButtons={true}
              currentStatus={cv.status}
            />
          </div>
        ))}
      </div>
    );
  };

  const PaginationControls = () => {
    const { page, pages, total } = pagination;
    
    if (total === 0) return null;

    return (
      <div className="mt-8 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 px-6 py-4">
        <div className="flex flex-1 items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{Math.min((page - 1) * 10 + 1, total)}</span>
            {' '}-{' '}
            <span className="font-medium text-gray-900">{Math.min(page * 10, total)}</span>
            {' '}of{' '}
            <span className="font-medium text-gray-900">{total}</span> results
          </p>
          
          <div className="inline-flex items-center gap-1 rounded-lg shadow-sm">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-l-lg border border-gray-200 bg-white p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronFirst className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center border border-gray-200 bg-white p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center border border-gray-200 px-4 py-2 text-sm font-medium transition-colors
                    ${page === pageNum 
                      ? 'bg-gradient-to-br from-primary to-primary-dark text-white border-primary' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pages}
              className="relative inline-flex items-center border border-gray-200 bg-white p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handlePageChange(pages)}
              disabled={page === pages}
              className="relative inline-flex items-center rounded-r-lg border border-gray-200 bg-white p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronLast className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={activeTab === 'pending' ? 'Search disabled for pending tab' : 'Search by name or email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={activeTab === 'pending'}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all duration-300 ${
              activeTab === 'pending' 
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
            }`}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReviewMode(!isReviewMode)}
            className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium
              text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
          >
            {isReviewMode ? (
              <>
                <List className="h-4 w-4 mr-2" />
                List View
              </>
            ) : (
              <>
                <Grid className="h-4 w-4 mr-2" />
                Review Mode
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white 
              rounded-xl text-sm font-medium hover:from-primary-dark hover:to-primary shadow-sm hover:shadow-md
              transition-all duration-300"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CVs
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
        <div className="flex gap-1">
          {['pending', 'approved', 'rejected'].map((status) => {
            const count = [...cvData.unlocked, ...cvData.locked].filter(cv => cv.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`
                  relative flex-1 py-2.5 px-4 rounded-md font-medium text-sm flex items-center justify-center gap-2
                  transition-all duration-200
                  ${activeTab === status
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  }
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className={`
                  rounded-full px-2 py-0.5 text-xs font-medium
                  ${activeTab === status
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-slate-200/80 text-slate-600'
                  }
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      

      {/* Error Alert */}
      {unlockError && (
        <div className="bg-gradient-to-br from-red-50 to-red-50/50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">Error Unlocking CV</h3>
            <p className="text-red-600 text-sm">{unlockError}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative group">
        {/* Review Mode Navigation */}
        {isReviewMode && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-10 px-6">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-300
                p-3 rounded-full bg-white shadow-lg border border-gray-200 
                ${currentIndex === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-50 hover:scale-105'
                } transform -translate-x-6`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentIndex >= getAllCVs().length - 1}
              className={`pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-300
                p-3 rounded-full bg-white shadow-lg border border-gray-200
                ${currentIndex >= getAllCVs().length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-50 hover:scale-105'
                } transform translate-x-6`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {renderContent()}
      </div>

      {/* Pagination */}
      <PaginationControls />

      {/* Modals */}
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