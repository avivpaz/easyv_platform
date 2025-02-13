import React, { useState, useEffect } from 'react';
import { 
    FileText, AlertCircle, Upload, Grid, List,
    ChevronLeft, ChevronRight,Search,ChevronFirst,ChevronLast,AlertTriangle, Users
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
  const [expandedCV, setExpandedCV] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const [activeTab, setActiveTab] = useState('pending');

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
      .filter(cv => {
        if (activeTab === 'pending') return cv.status === 'pending' || !cv.status;
        return cv.status === activeTab;
      })
      .filter(cv => 
        searchQuery === '' || 
        cv.candidate.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cv.candidate.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
            {searchQuery ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Results Found</h3>
                <p className="text-gray-600 leading-relaxed">
                  Try adjusting your search terms or clear the search to see all candidates.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No CVs Found</h3>
                <p className="text-gray-600 leading-relaxed">
                  {activeTab === 'pending' ? 'No pending applications to review.' :
                   activeTab === 'approved' ? 'No approved candidates yet.' :
                   'No rejected applications.'}
                </p>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Pending Applications Section */}
        {filteredCVs.filter(cv => cv.status === 'pending' || !cv.status).length > 0 && (
          <section>
            <div className="space-y-4">
              {filteredCVs.filter(cv => cv.status === 'pending' || !cv.status).map(cv => (
                <CVCard
                  key={cv._id}
                  cv={cv}
                  isExpanded={expandedCV === cv._id}
                  onToggle={() => setExpandedCV(expandedCV === cv._id ? null : cv._id)}
                  updateCVStatus={updateCVStatus}
                  onUnlock={handleUnlock}
                />
              ))}
            </div>
          </section>
        )}

        {/* Approved Applications Section */}
        {filteredCVs.filter(cv => cv.status === 'approved').length > 0 && (
          <section>
            <div className="space-y-4">
              {filteredCVs.filter(cv => cv.status === 'approved').map(cv => (
                <CVCard
                  key={cv._id}
                  cv={cv}
                  isExpanded={expandedCV === cv._id}
                  onToggle={() => setExpandedCV(expandedCV === cv._id ? null : cv._id)}
                  updateCVStatus={updateCVStatus}
                  onUnlock={handleUnlock}
                />
              ))}
            </div>
          </section>
        )}

        {/* Rejected Applications - Collapsed by default */}
        {filteredCVs.filter(cv => cv.status === 'rejected').length > 0 && (
          <section className="border-t border-gray-200 pt-6">
            <details className="group">
              <summary className="flex items-center gap-3 cursor-pointer list-none mb-4">
                <ChevronRight className="h-5 w-5 text-gray-400 transition-transform duration-300 group-open:rotate-90" />
              </summary>
              <div className="space-y-4">
                {filteredCVs.filter(cv => cv.status === 'rejected').map(cv => (
                  <CVCard
                    key={cv._id}
                    cv={cv}
                    isExpanded={expandedCV === cv._id}
                    onToggle={() => setExpandedCV(expandedCV === cv._id ? null : cv._id)}
                    updateCVStatus={updateCVStatus}
                    onUnlock={handleUnlock}
                  />
                ))}
              </div>
            </details>
          </section>
        )}

        {/* Empty State */}
        {filteredCVs.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600">Applications for this position will appear here.</p>
          </div>
        )}
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
    <div className="">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Tabs */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
          <div className="flex items-center gap-2 min-w-max pb-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 whitespace-nowrap
                ${activeTab === 'pending' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              To Review
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {cvData.stats.total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 whitespace-nowrap
                ${activeTab === 'approved' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Approved
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'approved' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {cvData.unlocked.concat(cvData.locked).filter(cv => cv.status === 'approved').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 whitespace-nowrap
                ${activeTab === 'rejected' 
                  ? 'bg-gray-600 text-white shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Rejected
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'rejected' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {cvData.unlocked.concat(cvData.locked).filter(cv => cv.status === 'rejected').length}
              </span>
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-white border-gray-200 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                transition-all duration-300"
            />
          </div>
          
          <div className="flex items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white 
                rounded-xl text-sm font-medium hover:from-primary-dark hover:to-primary shadow-sm hover:shadow-md
                transition-all duration-300"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CVs
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {unlockError && (
        <div className="bg-gradient-to-br from-red-50 to-red-50/50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">Error Unlocking CV</h3>
            <p className="text-red-600 text-sm">{unlockError}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative">
        {renderContent()}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <p className="text-sm text-gray-600 text-center sm:text-left">
            Showing <span className="font-medium text-gray-900">{Math.min((currentPage - 1) * 10 + 1, cvData.stats.total)}</span>
            {' '}-{' '}
            <span className="font-medium text-gray-900">{Math.min(currentPage * 10, cvData.stats.total)}</span>
            {' '}of{' '}
            <span className="font-medium text-gray-900">{cvData.stats.total}</span> results
          </p>
          
          <div className="inline-flex items-center gap-1 rounded-lg shadow-sm mx-auto sm:mx-0 sm:ml-auto">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-lg border border-gray-200 bg-white p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronFirst className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center border border-gray-200 bg-white p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="hidden sm:flex">
              {Array.from({ length: Math.min(5, Math.ceil(cvData.stats.total / 10)) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center border border-gray-200 px-4 py-2 text-sm font-medium transition-colors
                      ${currentPage === pageNum 
                        ? 'bg-gradient-to-br from-primary to-primary-dark text-white border-primary' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-600 border-t border-b border-gray-200 bg-white">
              Page {currentPage}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(cvData.stats.total / 10)}
              className="relative inline-flex items-center border border-gray-200 bg-white p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handlePageChange(Math.ceil(cvData.stats.total / 10))}
              disabled={currentPage === Math.ceil(cvData.stats.total / 10)}
              className="relative inline-flex items-center rounded-r-lg border border-gray-200 bg-white p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronLast className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

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