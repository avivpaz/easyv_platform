import React, { useState, useEffect } from 'react';
import { 
    FileText, Download, Clock, Upload, GraduationCap, 
    Briefcase, ChevronRight, ChevronLeft, Code, Filter,
    Link, X, Trash2, Users, Grid, List, ChevronDown,
    ChevronUp, ThumbsUp, ThumbsDown, Menu
} from 'lucide-react';
import { jobService } from '../services/jobService';
import UploadModal from './UploadModal';
import { cvService } from '../services/cvService';
import CopyButton from './CopyButton'
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

const ReviewModeCard = ({ cv, onNext, onPrevious, currentIndex, total, updateCVStatus }) => {
  const [expandedExp, setExpandedExp] = useState(null);

  const handleKeep = async () => {
    try {
      await cvService.updateCVStatus(cv._id, 'approved');
      updateCVStatus(cv._id, 'approved');
      onNext();
    } catch (error) {
      console.error('Error approving CV:', error);
    }
  };
  
  const handleRemove = async () => {
    try {
      await cvService.updateCVStatus(cv._id, 'rejected');
      updateCVStatus(cv._id, 'rejected');
      onNext();
    } catch (error) {
      console.error('Error rejecting CV:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[80vh] md:h-[85vh] flex flex-col relative">
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

      <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/5 flex items-center justify-center">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div>
          <h3 className="font-medium text-sm md:text-base text-gray-900">{cv.candidate.fullName}</h3>
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
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Status status={cv.status} />
          <div className="bg-primary-dark text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
            {currentIndex + 1} / {total}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 flex-grow overflow-auto">
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

      <div className="bg-gray-50 px-3 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between border-t border-gray-200 gap-2 md:gap-0">
        <div className="flex items-center text-xs md:text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1 md:mr-2" />
          Applied {new Date(cv.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg text-xs md:text-sm">
            <Download className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden md:inline">Download CV</span>
            <span className="md:hidden">CV</span>
          </a>
          <button onClick={handleRemove}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs md:text-sm">
            <ThumbsDown className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden md:inline">Reject</span>
          </button>
          <button onClick={handleKeep}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs md:text-sm">
            <ThumbsUp className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden md:inline">Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
const CompactCVCard = ({ cv, isExpanded, onToggle, updateCVStatus }) => {
  const [expandedExp, setExpandedExp] = useState(null);

  const handleKeep = async () => {
    try {
      await cvService.updateCVStatus(cv._id, 'approved');
      updateCVStatus(cv._id, 'approved');
    } catch (error) {
      console.error('Error approving CV:', error);
    }
  };
  
  const handleRemove = async () => {
    try {
      await cvService.updateCVStatus(cv._id, 'rejected');
      updateCVStatus(cv._id, 'rejected');
    } catch (error) {
      console.error('Error rejecting CV:', error);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${isExpanded ? 'h-[80vh] md:h-[85vh] flex flex-col' : ''}`}>
      <div className="p-3 md:p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
           onClick={onToggle}>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/5 flex items-center justify-center">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div>
          <h3 className="font-medium text-sm md:text-base text-gray-900">{cv.candidate.fullName}</h3>
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
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Status status={cv.status} />
          {isExpanded ? 
            <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-gray-400" /> : 
            <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          }
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
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

          <div className="bg-gray-50 px-3 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between border-t border-gray-200 gap-2 md:gap-0">
            <div className="flex items-center text-xs md:text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1 md:mr-2" />
              Applied {new Date(cv.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg text-xs md:text-sm">
                <Download className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Download CV</span>
                <span className="md:hidden">CV</span>
              </a>
              <button onClick={handleRemove}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs md:text-sm">
                <ThumbsDown className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Reject</span>
              </button>
              <button onClick={handleKeep}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs md:text-sm">
                <ThumbsUp className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Approve</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const JobCVs = ({ jobId }) => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(['pending']);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCvId, setExpandedCvId] = useState(null);

  const uploadUrl = `${process.env.REACT_APP_FRONTEND_URL}/jobs/${jobId}`;

  const updateCVStatus = (cvId, newStatus) => {
    setCvs(prevCvs => 
      prevCvs.map(cv => 
        cv._id === cvId ? { ...cv, status: newStatus } : cv
      )
    );
  };

  const fetchCVs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobCVs(jobId);
      setCvs(data);
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

  const handleNext = () => {
    if (currentIndex < filteredCVs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const filteredCVs = cvs.filter(cv => 
    filters.includes('all') ? true : filters.includes(cv.status)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Applications {cvs.length > 0 && `(${cvs.length})`}
          </h2>
          {cvs.length > 0 && (
            <div className="flex flex-wrap gap-3">
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

              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setIsReviewMode(false)}
                  className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors
                    ${!isReviewMode 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden md:inline">List</span>
                </button>
                <button
                  onClick={() => setIsReviewMode(true)}
                  className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors
                    ${isReviewMode 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Grid className="h-4 w-4" />
                  <span className="hidden md:inline">Review</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-lg hover:bg-primary-light text-xs md:text-sm"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden md:inline">Upload CVs</span>
            <span className="md:hidden">Upload</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
          <p>{error}</p>
        </div>
      ) : filteredCVs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Still waiting for applications? </h3>
          <p className="text-sm text-gray-500">Share this listing on more platforms or invite candidates directly to apply!</p>
        </div>
      ) : isReviewMode ? (
        <ReviewModeCard
          cv={filteredCVs[currentIndex]}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentIndex={currentIndex}
          total={filteredCVs.length}
          updateCVStatus={updateCVStatus}
        />
      ) : (
        <div className="space-y-4">
          {filteredCVs.map(cv => (
            <CompactCVCard 
              key={cv._id} 
              cv={cv} 
              isExpanded={expandedCvId === cv._id}
              updateCVStatus={updateCVStatus}
              onToggle={() => setExpandedCvId(expandedCvId === cv._id ? null : cv._id)}
            />
          ))}
        </div>
      )}

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        jobId={jobId}
        onSuccess={handleUploadSuccess}
      />

      {showShareLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-xl md:rounded-xl p-4 md:p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Upload Link</h3>
              <button onClick={() => setShowShareLink(false)} className="text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-2 md:p-3 rounded-lg">
              <input
                type="text"
                readOnly
                value={uploadUrl}
                className="flex-1 bg-transparent border-none text-sm focus:ring-0 text-gray-600"
              />
              <button
                onClick={() => navigator.clipboard.writeText(uploadUrl)}
                className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-light text-sm"
              >
                Copy
              </button>
            </div>
            <p className="mt-3 text-xs md:text-sm text-gray-500">
              Share this link with candidates to let them upload their CVs directly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCVs;