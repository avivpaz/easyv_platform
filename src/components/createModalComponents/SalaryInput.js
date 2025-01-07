import React from 'react';

const SalaryInput = ({ 
  salaryMin,
  salaryMax,
  salaryCurrency,
  salaryPeriod,
  onChange
}) => {
  return (
    <div className="space-y-3 sm:space-y-0">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Salary Range <span className="text-gray-500 font-normal">(optional)</span>
      </label>
      
      {/* All inputs in single row on desktop, stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={salaryCurrency}
          onChange={(e) => onChange('salaryCurrency', e.target.value)}
          className="h-12 w-full sm:w-24 px-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="CAD">CAD</option>
          <option value="AUD">AUD</option>
        </select>

        <input
          type="number"
          value={salaryMin}
          onChange={(e) => onChange('salaryMin', e.target.value)}
          className="h-12 w-full sm:w-32 px-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="Minimum"
          min="0"
        />

        <input
          type="number"
          value={salaryMax}
          onChange={(e) => onChange('salaryMax', e.target.value)}
          className="h-12 w-full sm:w-32 px-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder="Maximum"
          min="0"
        />

        <select
          value={salaryPeriod}
          onChange={(e) => onChange('salaryPeriod', e.target.value)}
          className="h-12 w-full sm:w-32 px-3 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
        >
          <option value="hour">Per Hour</option>
          <option value="month">Per Month</option>
          <option value="year">Per Year</option>
        </select>
      </div>
    </div>
  );
};

export default SalaryInput;