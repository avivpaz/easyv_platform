import React, { useState } from 'react';
import { 
  FileText, Clock, GraduationCap, Briefcase, 
  ChevronDown, ArrowRight, Code, Lock, Users,
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

const EducationCard = ({ education }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg mt-1">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium text-gray-900">{education.degree}</h4>
            <p className="text-sm text-gray-600">{education.institution}</p>
            <div className="inline-flex items-center px-2.5 py-1 mt-1 bg-primary/5 rounded-full">
              <span className="text-xs font-medium text-primary">{education.year}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
const ExperienceCard = ({ experience, isExpanded, onToggle }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <button
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{experience.position}</h4>
              <p className="text-sm text-gray-600 mt-0.5">{experience.company}</p>
              <div className="inline-flex items-center px-2.5 py-1 mt-1 bg-primary/5 rounded-full">
              <span className="text-xs font-medium text-primary">{experience.dates}</span>
            </div>
            </div>
          </div>
          {experience.responsibilities?.length > 0 && (
            <ChevronDown 
              className={`h-5 w-5 text-gray-400 transition-transform duration-300 ease-in-out flex-shrink-0
              ${isExpanded ? 'rotate-180' : ''}`} 
            />
          )}
        </div>
      </button>
      
      {isExpanded && experience.responsibilities && (
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="p-4 space-y-3">
            {experience.responsibilities.map((resp, idx) => (
              <div key={idx} className="flex items-start gap-2 group">
              <ArrowRight className="h-4 w-4 text-primary/60 mt-1 flex-shrink-0 group-hover:text-primary transition-colors duration-200" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  {resp}
                </p>
              </div>
            ))}
          </div>
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
  const [isHovered, setIsHovered] = useState(false);

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
    <div 
    className={`bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col transition-all duration-200 
    ${isExpanded || isReviewMode ? 'max-h-[85vh]' : 'h-auto'} relative`}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
  >
    {/* Buttons on Hover */}
    {cv.visibility != 'locked' && isHovered && (
      <div className="absolute top-3 right-3 flex gap-2">
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
                { cv.candidate.fullName}
              </h3>
              <div className="flex items-center gap-3 flex-shrink-0">
              {cv.visibility != 'locked' && !isHovered && (

              <div>
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
                        <EducationCard key={index} education={edu} />
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