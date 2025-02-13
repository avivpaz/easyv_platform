import React, { useState } from 'react';
import { 
  X, FileText, GraduationCap, Briefcase, Code,
  ThumbsUp, ThumbsDown, Clock, ChevronDown, Users, Mail, Phone, Unlock, Sparkles
} from 'lucide-react';
import CopyButton from './CopyButton';
import PDFViewerModal from './PDFViewerModal';
import TextViewerModal from './TextViewerModal';

const CVDetailsModal = ({ isOpen, onClose, cv, updateCVStatus, isLocked, onUnlock }) => {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchEnd - touchStart;
    const isDownSwipe = distance > 100;
    
    if (isDownSwipe) {
      onClose();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen md:flex items-center justify-center p-2 sm:p-4">
        <div 
          className="relative bg-white w-full max-w-4xl rounded-xl shadow-xl flex flex-col max-h-[90vh] md:max-h-[85vh]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-500 rounded-lg 
              hover:bg-gray-100 transition-all duration-300 z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Mobile Close Indicator */}
          <div className="md:hidden flex justify-center py-2 touch-none">
            <div className="w-12 h-1 rounded-full bg-gray-300"></div>
          </div>

          {/* Enhanced Header */}
          <div className="flex-none">
            {/* Main Header */}
            <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left side - Candidate Info */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 
                    flex items-center justify-center border border-primary/10 flex-shrink-0 mx-auto sm:mx-0">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center sm:text-left">
                      {cv.candidate.fullName}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        cv.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        cv.status === 'rejected' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        {cv.status ? cv.status.charAt(0).toUpperCase() + cv.status.slice(1) : 'Pending  '}
                      </div>
                      {cv.ranking && cv.ranking.category && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          cv.ranking.category === 'Excellent Match' ? 'bg-emerald-50 text-emerald-700' :
                          cv.ranking.category === 'Good Match' ? 'bg-emerald-50 text-emerald-700' :
                          cv.ranking.category === 'Potential Match' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {cv.ranking.category}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        Applied {new Date(cv.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center justify-center sm:justify-end gap-3 mt-4 sm:mt-0">
                  {(cv.submissionType || cv.fileUrl || cv.rawText) && (
                    <button
                      onClick={() => cv.submissionType === "text" ? setIsTextOpen(true) : setIsPdfOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium 
                        bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-all duration-300"
                    >
                      <FileText className="h-4 w-4 text-gray-500" />
                      {cv.submissionType === "text" ? "View Application" : "View Original CV"}
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              {!isLocked && (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {cv.candidate.email && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 
                      rounded-lg border border-gray-100 w-full sm:w-auto">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{cv.candidate.email}</span>
                      <div className="pl-2 border-l border-gray-200 ml-auto sm:ml-0">
                        <CopyButton text={cv.candidate.email} label="email" />
                      </div>
                    </div>
                  )}
                  {cv.candidate.phone && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 
                      rounded-lg border border-gray-100 w-full sm:w-auto">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{cv.candidate.phone}</span>
                      <div className="pl-2 border-l border-gray-200 ml-auto sm:ml-0">
                        <CopyButton text={cv.candidate.phone} label="phone" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* AI Assessment */}
              {cv.ranking && cv.ranking.justification && (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-4 border border-blue-100 shadow-sm">
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

              {/* Summary Section */}
              {cv.candidate.summary && (
                <section>
                  <h4 className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Professional Summary</span>
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {cv.candidate.summary}
                  </p>
                </section>
              )}

              {/* Experience and Education Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Experience Section */}
                <section className="lg:col-span-2">
                  <h4 className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Experience</span>
                  </h4>
                  <div className="space-y-6">
                    {cv.candidate.experience?.map((exp, index) => (
                      <div key={index} className="relative pl-4 border-l-2 border-gray-200">
                        <div className="mb-3">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h5 className="font-semibold text-gray-900">{exp.position}</h5>
                            {exp.isRelevant && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                                Relevant
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">{exp.company}</span>
                            {exp.dates && (
                              <>
                                <span className="text-gray-300 hidden sm:inline">•</span>
                                <span className="text-gray-500 w-full sm:w-auto">{exp.dates}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {exp.responsibilities && (
                          <div className="space-y-2">
                            {exp.responsibilities.map((resp, idx) => (
                              <p key={idx} className="text-sm text-gray-600 pl-4 relative">
                                <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                {resp}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Education Section */}
                <section>
                  <h4 className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Education</span>
                  </h4>
                  <div className="space-y-6">
                    {cv.candidate.education?.map((edu, index) => (
                      <div key={index} className="relative pl-4 border-l-2 border-gray-200">
                        <div className="mb-3">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h5 className="font-semibold text-gray-900">{edu.degree}</h5>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">{edu.institution}</span>
                            {edu.year && (
                              <>
                                <span className="text-gray-300 hidden sm:inline">•</span>
                                <span className="text-gray-500 w-full sm:w-auto">{edu.year}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Skills Section */}
                <section>
                  <h4 className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Code className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cv.candidate.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-sm bg-white text-gray-700 rounded-md 
                          border border-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Footer with Status Controls or Unlock Button */}
          <div className="flex-none border-t border-gray-100 bg-gray-50 p-4 rounded-b-xl">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {isLocked ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnlock(cv._id);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold 
                    text-white bg-gradient-to-r from-primary to-primary-dark 
                    hover:from-primary-dark hover:to-primary rounded-lg 
                    transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Unlock className="h-4 w-4" />
                  Unlock (1 credit)
                </button>
              ) : (
                <div className="flex flex-wrap w-full sm:w-auto items-center gap-2">
                  {cv.status !== 'pending' && (
                    <button
                      onClick={() => {
                        updateCVStatus(cv._id, 'pending');
                        onClose();
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium
                        bg-primary text-white rounded-lg hover:bg-primary-dark 
                        transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <Clock className="h-4 w-4" />
                      Mark as Pending
                    </button>
                  )}
                  {cv.status !== 'approved' && (
                    <button
                      onClick={() => {
                        updateCVStatus(cv._id, 'approved');
                        onClose();
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium
                        bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 
                        transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Approve
                    </button>
                  )}
                  {cv.status !== 'rejected' && (
                    <button
                      onClick={() => {
                        updateCVStatus(cv._id, 'rejected');
                        onClose();
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium
                        bg-gray-600 text-white rounded-lg hover:bg-gray-700 
                        transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
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

export default CVDetailsModal; 