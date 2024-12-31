import React, { useState } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';

const JobStatusDropdown = ({ currentStatus, onStatusChange, isUpdating }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statuses = [
    { value: 'active', label: 'Active', textColor: 'text-green-800' },
    { value: 'draft', label: 'Draft', textColor: 'text-gray-800' },
    { value: 'closed', label: 'Closed', textColor: 'text-red-800' }
  ];

  const getStatusStyle = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      closed: "bg-red-100 text-red-800"
    };
    return styles[status];
  };

  const handleStatusClick = async (status) => {
    if (status !== currentStatus) {
      await onStatusChange(status);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Status Button */}
      <button
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`relative inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium 
          ${getStatusStyle(currentStatus)} 
          ${isUpdating ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
      >
        {isUpdating ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown menu */}
          <div className="absolute left-0 z-50 mt-2 w-40 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                  <span className={`inline-flex items-center gap-2
                    ${currentStatus === status.value ? 'font-medium' : 'font-normal'}
                  `}>
                    <span className={`h-2 w-2 rounded-full ${getStatusStyle(status.value)}`} />
                    {status.label}
                  </span>
                  {currentStatus === status.value && (
                    <Check className={`h-4 w-4 ${status.textColor}`} />
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