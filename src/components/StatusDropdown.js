import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

const StatusBadge = ({ status, showIcon = true }) => {
  const getStatusStyles = (status) => ({
    active: 'bg-green-100 text-green-800',
    closed: 'bg-red-100 text-red-800'
  })[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(status)}`}>
      {status === 'active' ? 'Active' : 'Closed'}
      {showIcon && <ChevronDown className="h-3 w-3 opacity-60" />}
    </span>
  );
};

const StatusDropdown = ({ status, isUpdating, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const statusOptions = ['active', 'closed'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`transition-all ${isUpdating ? 'opacity-75 cursor-not-allowed' : 'hover:ring-2 hover:ring-offset-2 hover:ring-offset-primary hover:ring-opacity-50'}`}
      >
        {isUpdating ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating...
          </span>
        ) : (
          <StatusBadge status={status} />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-xl z-50 border border-gray-100 p-1">
          {statusOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                onStatusChange(option);
                setIsOpen(false);
              }}
              disabled={option === status}
              className="w-full p-1 rounded-md disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <StatusBadge status={option} showIcon={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;