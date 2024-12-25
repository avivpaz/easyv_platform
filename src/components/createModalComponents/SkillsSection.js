import React, { useState, useEffect } from 'react';
import { X, Plus, GripVertical } from 'lucide-react';

const SkillsSection = ({ 
  type, 
  skills, 
  onAddSkill, 
  onRemoveSkill, 
  onReorderSkills,
  inputValue,
  onInputChange
}) => {
  const [dragIndex, setDragIndex] = useState(null);
  
  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    
    const newSkills = [...skills];
    const draggedSkill = newSkills[dragIndex];
    newSkills.splice(dragIndex, 1);
    newSkills.splice(index, 0, draggedSkill);
    
    onReorderSkills(newSkills);
    setDragIndex(index);
  };

  const isRequired = type === 'required';
  const bgColor = isRequired ? 'bg-primary/10' : 'bg-gray-100';
  const textColor = isRequired ? 'text-primary' : 'text-gray-700';
  const borderColor = isRequired ? 'border-primary/20' : 'border-gray-200';
  const buttonBgColor = isRequired ? 'bg-primary/5' : 'bg-gray-100';
  const buttonHoverBgColor = isRequired ? 'hover:bg-primary/10' : 'hover:bg-gray-200';
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {isRequired ? 'Must-have skills for this role' : 'Bonus skills to highlight'}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddSkill())}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          placeholder={`Add ${isRequired ? 'required' : 'nice-to-have'} skills`}
        />
        <button
          type="button"
          onClick={onAddSkill}
          className={`p-2.5 ${buttonBgColor} ${textColor} rounded-xl ${buttonHoverBgColor}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border border-gray-100">
        {skills.map((skill, index) => (
          <span
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={() => setDragIndex(null)}
            className={`inline-flex items-center gap-1 px-3 py-1 ${bgColor} ${textColor} border ${borderColor} rounded-full text-sm cursor-move`}
          >
            <GripVertical className="h-3.5 w-3.5" />
            {skill}
            <button
              type="button"
              onClick={() => onRemoveSkill(skill)}
              className={isRequired ? 'hover:text-primary-dark' : 'hover:text-gray-900'}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillsSection;