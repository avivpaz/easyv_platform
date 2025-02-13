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
  const [showFullAssessment, setShowFullAssessment] = useState(false);

  const isLocked = cv.visibility === 'locked';
  const MAX_ASSESSMENT_LENGTH = 250;

  const truncateAssessment = (text) => {
    if (!text) return '';
    if (text.length <= MAX_ASSESSMENT_LENGTH) return text;
    return showFullAssessment ? text : `${text.substring(0, MAX_ASSESSMENT_LENGTH)}...`;
  };

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
          <div className="p-3">
            <div className="flex items-start gap-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Name, Status and Ranking in one line */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {cv.candidate.fullName}
                    </h3>
                    {cv.ranking && cv.ranking.category && (
                      <RankingBadge category={cv.ranking.category} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isLocked && <UnlockButton onUnlock={handleUnlock} loading={unlocking} />}
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      cv.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                      cv.status === 'rejected' ? 'bg-red-50 text-red-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {cv.status ? cv.status.charAt(0).toUpperCase() + cv.status.slice(1) : 'Pending'}
                    </div>
                  </div>
                </div>

                {/* Background Info with Date */}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                  {cv.candidate.experience?.[0] && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-gray-400" />
                      <span className="truncate">{cv.candidate.experience[0].position}</span>
                    </div>
                  )}
                  {cv.candidate.education?.[0] && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3 text-gray-400" />
                      <span className="truncate">{cv.candidate.education[0].degree}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>{new Date(cv.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* AI Assessment */}
                {cv.ranking && cv.ranking.justification && (
                  <div className="mt-2 relative">
                    <div className="text-xs text-gray-600 leading-relaxed bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-blue-50/80 rounded-lg p-2 border border-blue-100/50">
                      <div className="flex items-center gap-1.5 mb-1 text-blue-700">
                        <Sparkles className="h-3 w-3" />
                        <span className="font-medium">AI Assessment</span>
                      </div>
                      <div className="line-clamp-3">{truncateAssessment(cv.ranking.justification)}</div>
                      {cv.ranking.justification.length > MAX_ASSESSMENT_LENGTH && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFullAssessment(!showFullAssessment);
                          }}
                          className="ml-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {showFullAssessment ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
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