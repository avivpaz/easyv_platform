import React, { useState } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';

const JobStatusDropdown = ({ currentStatus, onStatusChange, isUpdating }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statuses = [
    { value: 'active', label: 'Active', textColor: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'draft', label: 'Draft', textColor: 'text-gray-600', bgColor: 'bg-gray-100' },
    { value: 'closed', label: 'Closed', textColor: 'text-red-600', bgColor: 'bg-red-100' }
  ];

  const getStatusStyle = (status) => {
    const styleMap = {
      active: "bg-green-100 text-green-600",
      paused: "bg-yellow-100 text-yellow-600",
      closed: "bg-red-100 text-red-600"
    };
    return styleMap[status] || "bg-gray-100 text-gray-600";
  };

  const handleStatusClick = async (status) => {
    if (status !== currentStatus) {
      await onStatusChange(status);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`
          relative inline-flex items-center gap-2 pr-2 py-1.5 rounded-full
          text-sm font-medium transition-colors
          ${getStatusStyle(currentStatus)}
          ${isUpdating ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'}
        `}
      >
        {isUpdating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <span className={`h-2 w-2 rounded-full ${getStatusStyle(currentStatus)}`} />
            <span>{currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="absolute left-0 z-50 mt-2 w-44 rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="py-1">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusClick(status.value)}
                  className={`
                    w-full text-left px-4 py-2 text-sm flex items-center justify-between
                    ${currentStatus === status.value ? 'bg-gray-50' : 'hover:bg-gray-50'}
                    ${status.textColor}
                  `}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${status.bgColor}`} />
                    {status.label}
                  </span>
                  {currentStatus === status.value && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JobStatusDropdown;