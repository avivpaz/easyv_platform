import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, Users, MapPin, Clock, MoreVertical, ExternalLink, EyeOff,Edit2 } from 'lucide-react';

const JobItem = ({ job, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyles = (status) => {
    const isOpen = status === 'active';
    return {
      className: `inline-flex px-3 py-1 rounded-full text-xs font-medium ${
        isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`,
      label: isOpen ? 'Active' : 'Closed'
    };
  };

  const status = getStatusStyles(job.status);

  const handleSettingClick = (e, action) => {
    e.stopPropagation();
    if (action === 'close') {
      onStatusChange?.(job._id, 'inactive');
    }
    setIsOpen(false);
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer relative w-full">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary/70" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                  {job.title}
                </h2>
                <span className="text-xs text-gray-500">
                  {formatDate(job.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={status.className}>
                  {status.label}
                </span>
             
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{job.workType}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{job.employmentType}</span>
              </div>
            </div>

            {(job.requiredSkills?.length > 0 || job.niceToHaveSkills?.length > 0) && (
              <div className="mt-3 space-y-2">
                {job.requiredSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span
                        key={`req-${index}`}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {job.niceToHaveSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.niceToHaveSkills.map((skill, index) => (
                      <span
                        key={`nice-${index}`}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobItem;