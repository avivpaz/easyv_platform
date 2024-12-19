import React, { useState } from 'react';
import { 
  FileText, Clock, GraduationCap, Briefcase, 
  ChevronDown, ChevronUp, Code, Lock, Users,
  ThumbsUp, ThumbsDown, Unlock
} from 'lucide-react';
import CopyButton from './CopyButton';
import PDFViewerModal from './PDFViewerModal';
import TextViewerModal from './TextViewerModal';

const Status = ({ status }) => {
  const variants = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <span className={`${variants[status]} px-2 py-1 text-xs font-medium rounded-full border`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const UnlockButton = ({ onUnlock, creditsRequired = 1, loading = false }) => (
  <button
    onClick={onUnlock}
    disabled={loading}
    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 rounded-lg transition-colors"
  >
    {loading ? (
      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      <Unlock className="h-4 w-4" />
    )}
    Unlock ({creditsRequired} credit)
  </button>
);

const ExperienceCard = ({ experience, isExpanded, onToggle }) => (
<div  className="bg-gray-50 rounded-lg border-l-4 border-primary/40">
    <button
      className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{experience.position}</h4>
          <p className="text-sm text-gray-600">{experience.company}</p>
          <p className="text-sm text-gray-500">{experience.dates}</p>
        </div>
        {experience.responsibilities?.length > 0 && (
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        )}
      </div>
    </button>
    {isExpanded && experience.responsibilities && (
      <div className="px-3 pb-3 space-y-1.5 border-t border-gray-100">
        {experience.responsibilities.map((resp, idx) => (
          <p key={idx} className="text-sm text-gray-600 pl-4 relative before:absolute before:left-1.5 before:top-2 before:w-1 before:h-1 before:bg-gray-400 before:rounded-full">
            {resp}
          </p>
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
  onNext,
  onPrevious,
  currentIndex,
  total
}) => {
  const [expandedExp, setExpandedExp] = useState(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const handleKeep = async () => {
    try {
      await updateCVStatus(cv._id, 'approved');
      if (isReviewMode && onNext) onNext();
    } catch (error) {
      console.error('Error approving CV:', error);
    }
  };
  
  const handleRemove = async () => {
    try {
      await updateCVStatus(cv._id, 'rejected');
      if (isReviewMode && onNext) onNext();
    } catch (error) {
      console.error('Error rejecting CV:', error);
    }
  };

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
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col transition-all duration-200 
    ${isExpanded || isReviewMode ? 'max-h-[85vh]' : 'h-auto'} relative group`}>
          {/* Buttons on Hover */}
          {cv.visibility != 'locked' && (

          <div className="absolute top-3 right-3 hidden group-hover:flex gap-2">
     {cv.status !== 'rejected' && (
      <button
        onClick={handleRemove}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <ThumbsDown className="h-4 w-4 text-red-500" />
        Reject
      </button>
    )}
    {cv.status !== 'approved' && (
      <button
        onClick={handleKeep}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        <ThumbsUp className="h-4 w-4" />
        Approve
      </button>
    )}
  </div>
          )}
      {/* Header */}
      <div 
        className={`p-4 bg-gray-50 ${!isReviewMode ? 'cursor-pointer hover:bg-gray-100' : ''} transition-colors`}
        onClick={!isReviewMode ? onToggle : undefined}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-gray-900 truncate">
                {cv.visibility === 'locked' ? 
                  cv.candidate.fullName.replace(/(?<=^[\w-]{3})./g, '*') : 
                  cv.candidate.fullName
                }
              </h3>
              <div className="flex items-center gap-3 flex-shrink-0">
              {cv.visibility != 'locked' && (

              <div className="group-hover:hidden">
                  <Status status={cv.status || 'pending'} />
                </div>
              )}
                {cv.visibility === 'locked' && (
                  <UnlockButton onUnlock={handleUnlock} loading={unlocking} />
                )}
                {!isReviewMode && (
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                )}
              </div>
            </div>
            {cv.visibility === 'locked' ? (
              <div className="mt-1 space-y-1">
                <p className="text-sm text-gray-600">{cv.candidate.experience} years experience</p>
                <p className="text-sm text-gray-500">{cv.candidate.skills} skills listed</p>
              </div>
            ) : (
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">{cv.candidate.email}</p>
                  <CopyButton text={cv.candidate.email} label="email" />
                </div>
                {cv.candidate.phone && (
                  <div className="flex items-center gap-2">
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
          {cv.visibility === 'locked' ? (
            <div className="p-8 text-center">
              <Lock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unlock CV Profile</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Get full access to this candidate's details including contact information,
                complete experience, education history, and skill set.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Summary */}
              {cv.candidate.summary && (
                <div className="p-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">Professional Summary</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{cv.candidate.summary}</p>
                  </div>
                </div>
              )}

              {/* Main Content Grid */}
              <div className="grid md:grid-cols-3 gap-6 p-6">
                {/* Education */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium text-gray-900">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Education
                  </h4>
                  <div className="space-y-3">
                    {cv.candidate.education?.map((edu, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-primary">
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium text-gray-900">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Experience
                  </h4>
                  <div className="space-y-3">
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
                  <h4 className="flex items-center gap-2 font-medium text-gray-900">
                    <Code className="h-5 w-5 text-primary" />
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cv.candidate.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-sm font-medium bg-primary/5 text-primary-dark rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 border-t p-4 flex flex-col md:flex-row gap-3 justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Applied {new Date(cv.createdAt).toLocaleDateString()}
          </div>
          {cv.submissionType && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/5 text-primary-dark rounded-full text-xs font-medium">
              <FileText className="h-3.5 w-3.5" />
              {cv.submissionType === "text" ? "Website Application" : "File Upload"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {cv.fileUrl && (
            <button
              onClick={() => setIsPdfOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              View CV
            </button>
          )}
          {cv.rawText && (
            <button
              onClick={() => setIsTextOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              View Application
            </button>
          )}
       
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