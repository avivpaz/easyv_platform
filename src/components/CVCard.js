import React, { useState, useEffect } from 'react';
import { 
    FileText, AlertCircle, Clock, Upload, GraduationCap, 
    Briefcase, ChevronRight, ChevronLeft, Code, Filter,
    Link, X, Lock, Users, Grid, List, ChevronDown,
    ChevronUp, ThumbsUp, ThumbsDown, Unlock
} from 'lucide-react';
import { cvService } from '../services/cvService';
import CopyButton from './CopyButton';
import PDFViewerModal from './PDFViewerModal';
import TextViewerModal from './TextViewerModal';
const Status = ({ status }) => {
  const colors = {
    pending: 'bg-secondary text-primary-dark',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const UnlockButton = ({ onUnlock, creditsRequired = 1, loading = false }) => (
  <button
    onClick={onUnlock}
    disabled={loading}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 text-sm"
  >
    {loading ? (
      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    ) : (
      <Unlock className="h-4 w-4" />
    )}
    <span>Unlock ({creditsRequired} credit)</span>
  </button>
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
  const [unlocking, setUnlocking] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false); // Add this line

  const handleKeep = async () => {
    try {
      await cvService.updateCVStatus(cv._id, 'approved');
      updateCVStatus(cv._id, 'approved');
      if (isReviewMode && onNext) onNext();
    } catch (error) {
      console.error('Error approving CV:', error);
    }
  };
  
  const handleRemove = async () => {
    try {
      await cvService.updateCVStatus(cv._id, 'rejected');
      updateCVStatus(cv._id, 'rejected');
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

  const getSubmissionTypeText = (cv) => {
    if (cv.submissionType === "text") {
      return "Website Application";
    }
    if (cv.fileUrl) {
      return "CV File Upload";
    }
    return "Other";
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden 
      ${(isExpanded || isReviewMode) ? 'h-[80vh] md:h-[85vh] flex flex-col' : ''} 
      ${isReviewMode ? 'relative' : ''}`}>
      
      {/* Review Mode Navigation */}
      {isReviewMode && (
        <>
          <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-4">
            <button onClick={onPrevious} disabled={currentIndex === 0}
              className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-4">
            <button onClick={onNext} disabled={currentIndex === total - 1}
              className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </>
      )}

      {/* Header */}
      <div className={`p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between
        ${!isReviewMode ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={!isReviewMode ? onToggle : undefined}>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/5 flex items-center justify-center">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm md:text-base text-gray-900">
              {cv.visibility === 'locked' ? 
                cv.candidate.fullName.replace(/(?<=^[\w-]{3})./g, '*') : 
                cv.candidate.fullName
              }
            </h3>
            {cv.visibility === 'locked' ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-600">
                  {cv.candidate.experience} years experience
                </p>
                <p className="text-sm text-gray-500">
                  {cv.candidate.skills} skills listed
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <p className="text-xs md:text-sm text-gray-500">{cv.candidate.email}</p>
                  <CopyButton text={cv.candidate.email} label="email" />
                </div>
                {cv.candidate.phone && (
                  <div className="flex items-center gap-1">
                    <p className="text-xs md:text-sm text-gray-500">{cv.candidate.phone}</p>
                    <CopyButton text={cv.candidate.phone} label="phone" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Status status={cv.status || 'pending'} />
          {cv.visibility === 'locked' && (
            <UnlockButton onUnlock={handleUnlock} loading={unlocking} />
          )}
          {isReviewMode && (
            <div className="bg-primary-dark text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
              {currentIndex + 1} / {total}
            </div>
          )}
          {!isReviewMode && (
            isExpanded ? 
              <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-gray-400" /> : 
              <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {(isExpanded || isReviewMode) && (
        <>
          {cv.visibility === 'locked' ? (
            <div className="p-6 text-center border-t border-gray-200">
              <Lock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unlock CV Profile</h3>
              <p className="text-sm text-gray-500 mb-4">
                Get full access to this candidate's details including contact information,
                complete experience, education history, and skill set.
              </p>
              <UnlockButton onUnlock={handleUnlock} loading={unlocking} />
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
                {/* Education Section */}
                <div className="bg-primary/5 p-3 md:p-4 rounded-xl">
                  <h4 className="flex items-center gap-2 text-gray-800 font-medium mb-3 text-sm md:text-base">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Education
                  </h4>
                  <div className="space-y-3">
                    {cv.candidate.education?.map((edu, index) => (
                      <div key={index} className="bg-white p-2 md:p-3 rounded-lg border-l-4 border-primary shadow-sm">
                        <p className="font-medium text-sm md:text-base text-gray-900">{edu.degree}</p>
                        <p className="text-xs md:text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-xs md:text-sm text-gray-500">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Section */}
                <div className="bg-secondary/20 p-3 md:p-4 rounded-xl">
                  <h4 className="flex items-center gap-2 text-gray-800 font-medium mb-3 text-sm md:text-base">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Experience
                  </h4>
                  <div className="space-y-3">
                    {cv.candidate.experience?.map((exp, index) => (
                      <div key={index} className="bg-white p-2 md:p-3 rounded-lg border-l-4 border-primary shadow-sm">
                        <div className="flex items-center justify-between cursor-pointer"
                             onClick={() => setExpandedExp(expandedExp === index ? null : index)}>
                          <div>
                            <p className="font-medium text-sm md:text-base text-gray-900">{exp.position}</p>
                            <p className="text-xs md:text-sm text-gray-600">{exp.company}</p>
                            <p className="text-xs md:text-sm text-gray-500">{exp.dates}</p>
                          </div>
                          {exp.responsibilities?.length > 0 && (
                            <button className="p-1 hover:bg-gray-50 rounded-full">
                              {expandedExp === index ? 
                                <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              }
                            </button>
                          )}
                        </div>
                        {expandedExp === index && exp.responsibilities && (
                          <div className="mt-2 pl-2 md:pl-3 border-l-2 border-secondary space-y-1">
                            {exp.responsibilities.map((resp, idx) => (
                              <p key={idx} className="text-xs md:text-sm text-gray-600">• {resp}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Section */}
                <div className="bg-gray-50 p-3 md:p-4 rounded-xl">
                  <h4 className="flex items-center gap-2 text-gray-800 font-medium mb-3 text-sm md:text-base">
                    <Code className="h-4 w-4 text-primary" />
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cv.candidate.skills?.map((skill, index) => (
                      <span key={index} 
                        className="px-2 py-1 rounded-lg text-xs md:text-sm bg-white text-primary-dark border border-primary/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile Review Navigation */}
      {isReviewMode && (
        <div className="flex md:hidden justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
          <button onClick={onPrevious} disabled={currentIndex === 0}
            className="p-2 text-gray-600 disabled:opacity-50">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={onNext} disabled={currentIndex === total - 1}
            className="p-2 text-gray-600 disabled:opacity-50">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-3 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between border-t border-gray-200 gap-2 md:gap-0">
        <div className="flex items-center text-xs md:text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1 md:mr-2" />
          Applied {new Date(cv.createdAt).toLocaleDateString()}
          {cv.submissionType && (
            <div className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-primary-dark border border-primary/10 gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {getSubmissionTypeText(cv)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
    {cv.fileUrl && (
      <button
        onClick={() => setIsPdfOpen(true)}
        className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg text-xs md:text-sm"
      >
        <FileText className="h-3 w-3 md:h-4 md:w-4" />
        <span className="hidden md:inline">View CV</span>
        <span className="md:hidden">View</span>
      </button>
    )}
    {cv.rawText && (
      <button
        onClick={() => setIsTextOpen(true)}
        className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg text-xs md:text-sm"
      >
        <FileText className="h-3 w-3 md:h-4 md:w-4" />
        <span className="hidden md:inline">View Text</span>
        <span className="md:hidden">Text</span>
      </button>
    )}
    <button onClick={handleRemove}
      className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs md:text-sm"
    >
      <ThumbsDown className="h-3 w-3 md:h-4 md:w-4" />
      <span className="hidden md:inline">Reject</span>
    </button>
    <button onClick={handleKeep}
      className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs md:text-sm"
    >
      <ThumbsUp className="h-3 w-3 md:h-4 md:w-4" />
      <span className="hidden md:inline">Approve</span>
    </button>
  </div>
        </div>
        <TextViewerModal
    isOpen={isTextOpen}
    onClose={() => setIsTextOpen(false)}
    text={cv.rawText}
  />
        {/* PDF Viewer Modal */}
        <PDFViewerModal
          isOpen={isPdfOpen}
          onClose={() => setIsPdfOpen(false)}
          fileUrl={cv.fileUrl}
        />
      </div>
    );
  };

  export default CVCard