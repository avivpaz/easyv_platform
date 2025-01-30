import React from 'react';
import { Briefcase, Users, MapPin, Clock, DollarSign } from 'lucide-react';

const JobItem = ({ job, onStatusChange }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    
    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryMin.toLocaleString()}-${job.salaryMax.toLocaleString()} ${job.salaryCurrency}`;
    } else if (job.salaryMin) {
      return `${job.salaryMin.toLocaleString()}+ ${job.salaryCurrency}`;
    } else {
      return `Up to ${job.salaryMax.toLocaleString()} ${job.salaryCurrency}`;
    }
  };

  const getStatusStyles = (status) => {
    const isActive = status === 'active';
    return {
      className: `inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`,
      label: isActive ? 'Active' : 'Closed'
    };
  };

  const status = getStatusStyles(job.status);

  return (
    <div className="group bg-white border border-gray-200 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary/70" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                  {job.title}
                </h2>
                <span className="text-xs text-gray-500">
                  {formatDate(job.createdAt)}
                </span>
              </div>
              <div>
                <span className={status.className}>
                  {status.label}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-3">
              {job.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{job.workType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{job.employmentType}</span>
              </div>
              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatSalary()} / {job.salaryPeriod}</span>
                </div>
              )}
            </div>

            {(job.requiredSkills?.length > 0 || job.niceToHaveSkills?.length > 0) && (
              <div className="space-y-2">
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