import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, GraduationCap, Briefcase, 
  ChevronDown, ArrowRight, Code, Lock, Users,
  ThumbsUp, ThumbsDown, Unlock, Mail, Phone, Sparkles
} from 'lucide-react';
import CopyButton from './CopyButton';
import PDFViewerModal from './PDFViewerModal';
import TextViewerModal from './TextViewerModal';
import CustomTooltip from './CustomTooltip';
import RankingBadge from './RankingBadge';
import CVDetailsModal from './CVDetailsModal';

const UnlockButton = ({ onUnlock, creditsRequired = 1, loading = false }) => (
  <button
    onClick={onUnlock}
    disabled={loading}
    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary disabled:opacity-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
  >
    {loading ? (
      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      <Unlock className="h-4 w-4" />
    )}
    Unlock ({creditsRequired} credit)
  </button>
);

const EducationCard = ({ education }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary/30 transition-all duration-300">
    <h5 className="font-semibold text-gray-900">{education.degree}</h5>
    <p className="text-sm text-gray-600 mt-1">{education.institution}</p>
    {education.year && (
      <div className="inline-flex items-center px-3 py-1 mt-2 bg-gray-50 rounded-full">
        <span className="text-xs font-medium text-gray-700">{education.year}</span>
      </div>
    )}
  </div>
);

const ExperienceCard = ({ experience, isExpanded, onToggle }) => (
  <div className="bg-white rounded-xl border border-gray-200 hover:border-primary/30 transition-all duration-300">
    <button
      className="w-full p-4 text-left hover:bg-gray-50/50 transition-colors duration-300"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h5 className="font-semibold text-gray-900">{experience.position}</h5>
            {experience.isRelevant && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                Relevant
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{experience.company}</p>
          {experience.dates && (
            <div className="inline-flex items-center px-3 py-1 mt-2 bg-gray-50 rounded-full">
              <span className="text-xs font-medium text-gray-700">{experience.dates}</span>
            </div>
          )}
        </div>
        {experience.responsibilities?.length > 0 && (
          <ChevronDown 
            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
          />
        )}
      </div>
    </button>
    
    {isExpanded && experience.responsibilities && (
      <div className="border-t border-gray-100 p-4 bg-gray-50/50">
        {experience.responsibilities.map((resp, idx) => (
          <div key={idx} className="flex items-start gap-3 mt-2 first:mt-0">
            <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-600">{resp}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const CVCard = ({ 
  cv, 
  isExpanded, 
  onToggle, 
  updateCVStatus, 
  onUnlock,
  isReviewMode = false,
}) => {
  const [expandedExp, setExpandedExp] = useState(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const isLocked = cv.visibility === 'locked';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.status-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUnlock = async (e) => {
    e.stopPropagation();
    setUnlocking(true);
    try {
      await onUnlock(cv._id);
    } catch (error) {
      console.error('Error unlocking CV:', error);
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <>
      <div 
        className={`bg-white rounded-xl border border-gray-200 shadow-lg cursor-pointer
          hover:border-primary/30 transition-all duration-300`}
        onClick={() => setShowDetailsModal(true)}
      >
        {/* Header Section - Fixed */}
        <div className="flex-none">
          <div 
            className={`p-6 ${!isReviewMode && 'cursor-pointer'}`}
            onClick={!isReviewMode ? onToggle : undefined}
          >
            {/* Top Bar - Status and Actions */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cv.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                  cv.status === 'rejected' ? 'bg-red-50 text-red-700' :
                  'bg-yellow-50 text-yellow-700'
                }`}>
                  {cv.status ? cv.status.charAt(0).toUpperCase() + cv.status.slice(1) : 'Pending'}
                </div>
                <div className="text-xs text-gray-500">
                  Applied {new Date(cv.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isLocked && <UnlockButton onUnlock={handleUnlock} loading={unlocking} />}
                {!isReviewMode && (
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                )}
              </div>
            </div>

            {/* Main Info */}
            <div className="flex gap-6">
              {/* Avatar/Icon */}
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>

              {/* Candidate Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {cv.candidate.fullName}
                    </h3>
                  </div>
                  {cv.ranking && cv.ranking.category && (
                    <RankingBadge category={cv.ranking.category} />
                  )}
                </div>

                {/* AI Assessment */}
                {cv.ranking && cv.ranking.justification && (
                  <div className="mt-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-blue-900">AI Assessment</h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {cv.ranking.justification}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add the modal */}
      <CVDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        cv={cv}
        updateCVStatus={updateCVStatus}
        isLocked={isLocked}
        onUnlock={onUnlock}
      />
    </>
  );
};

export default CVCard;