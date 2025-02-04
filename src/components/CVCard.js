import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, GraduationCap, Briefcase, 
  ChevronDown, ArrowRight, Code, Lock, Users,
  ThumbsUp, ThumbsDown, Unlock, Mail, Phone
} from 'lucide-react';
import CopyButton from './CopyButton';
import PDFViewerModal from './PDFViewerModal';
import TextViewerModal from './TextViewerModal';
import CustomTooltip from './CustomTooltip';
import RankingBadge from './RankingBadge';

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
    <div className={`bg-white rounded-xl border border-gray-200 shadow-lg flex flex-col transition-all duration-300 
      ${isExpanded || isReviewMode ? 'max-h-[85vh]' : 'h-auto'} 
      ${!isReviewMode && 'hover:border-primary/30'} relative overflow-hidden`}>
      
      {/* Header */}
      <div 
        className={`p-6 bg-gradient-to-br from-gray-50 to-white ${!isReviewMode && 'cursor-pointer hover:bg-gray-50/50'} transition-colors duration-300`}
        onClick={!isReviewMode ? onToggle : undefined}
      >
        <div className="flex items-start gap-6">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {cv.candidate.fullName}
                  </h3>
                  {cv.ranking && cv.ranking.justification && (
                    <RankingBadge 
                      category={cv.ranking.category} 
                      justification={cv.ranking.justification}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {isLocked && (
                  <UnlockButton onUnlock={handleUnlock} loading={unlocking} />
                )}
                {!isReviewMode && (
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                )}
              </div>
            </div>

            {/* Contact Information - Only shown when unlocked */}
            {!isLocked && (
              <div className="mt-3 flex flex-wrap gap-4">
                {cv.candidate.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{cv.candidate.email}</p>
                    <CopyButton text={cv.candidate.email} label="email" />
                  </div>
                )}
                {cv.candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{cv.candidate.phone}</p>
                    <CopyButton text={cv.candidate.phone} label="phone" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {(isExpanded || isReviewMode) && (
        <div className="flex-1 overflow-auto">
          <div className="divide-y divide-gray-100">
            {/* Summary */}
            {cv.candidate.summary && (
              <div className="p-6">
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Professional Summary</h4>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {cv.candidate.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-8 p-6">
              {/* Education */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Education
                </h4>
                <div className="space-y-4">
                  {cv.candidate.education?.map((edu, index) => (
                    <EducationCard key={index} education={edu} />
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Experience
                </h4>
                <div className="space-y-4">
                  {cv.candidate.experience?.map((exp, index) => (
                    <ExperienceCard
                      key={index}
                      experience={exp}
                      isExpanded={expandedExp === index}
                      onToggle={() => setExpandedExp(expandedExp === index ? null : index)}
                    />
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                  <Code className="h-5 w-5 text-primary" />
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {cv.candidate.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-sm font-medium bg-gradient-to-br from-primary/10 to-primary/5 text-primary-dark rounded-lg hover:from-primary/20 hover:to-primary/10 transition-colors duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Applied {new Date(cv.createdAt).toLocaleDateString()}</span>
            </div>
            
            {(cv.submissionType || cv.fileUrl || cv.rawText) && (
              <CustomTooltip 
                content={cv.submissionType === "text" ? 
                  "View the original website application submission" : 
                  "View the original uploaded CV document"}
              >
                <button
                  onClick={() => cv.submissionType === "text" ? setIsTextOpen(true) : setIsPdfOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 hover:border-primary/30 rounded-lg transition-all duration-300"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{cv.submissionType === "text" ? "Website Application" : "CV Upload"}</span>
                </button>
              </CustomTooltip>
            )}
          </div>

          {/* Status Controls */}
          <div className="relative status-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                {cv.status === 'approved' && <ThumbsUp className="h-4 w-4 text-emerald-500" />}
                {cv.status === 'rejected' && <ThumbsDown className="h-4 w-4 text-red-500" />}
                {cv.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                {!cv.status && <Users className="h-4 w-4 text-gray-400" />}
                {cv.status ? cv.status.charAt(0).toUpperCase() + cv.status.slice(1) : 'Set Status'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-10">
                {cv.status !== 'pending' && (
                  <button
                    onClick={() => {
                      updateCVStatus(cv._id, 'pending');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <Clock className="h-4 w-4 text-yellow-500" />
                    Mark as Pending
                  </button>
                )}
                {cv.status !== 'approved' && (
                  <button
                    onClick={() => {
                      updateCVStatus(cv._id, 'approved');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <ThumbsUp className="h-4 w-4 text-emerald-500" />
                    Approve
                  </button>
                )}
                {cv.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      updateCVStatus(cv._id, 'rejected');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    Reject
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TextViewerModal
        isOpen={isTextOpen}
        onClose={() => setIsTextOpen(false)}
        text={cv.rawText}
      />
      <PDFViewerModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        fileUrl={cv.fileUrl}
      />
    </div>
  );
};

export default CVCard;