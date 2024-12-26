import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { LANGUAGES } from '../../utils/languageUtils';

const LanguageSelection = ({ formData, setFormData }) => {
  const [languageInput, setLanguageInput] = useState('');
  const [showLanguages, setShowLanguages] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguages(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addLanguage = (language) => {
    if (!formData.requirements.languages.includes(language)) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          languages: [...prev.requirements.languages, language]
        }
      }));
    }
    setLanguageInput('');
    setShowLanguages(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Language Requirements</h3>
      
      <div className="flex gap-2">
        {/* Language Selection */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Select language"
            value={languageInput}
            onChange={(e) => {
              setLanguageInput(e.target.value);
              setShowLanguages(true);
            }}
            onFocus={() => setShowLanguages(true)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl"
          />
          
          {/* Language Dropdown */}
          {showLanguages && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
              {LANGUAGES
                .filter(lang => 
                  !languageInput || 
                  lang.name.toLowerCase().includes(languageInput.toLowerCase())
                )
                .map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => addLanguage(lang.name)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    {lang.name}
                    {formData.requirements.languages.includes(lang.name) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const selectedLang = LANGUAGES.find(
              lang => lang.name.toLowerCase() === languageInput.toLowerCase()
            );
            if (selectedLang) {
              addLanguage(selectedLang.name);
            }
          }}
          className="p-2.5 bg-primary/5 text-primary rounded-xl hover:bg-primary/10"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Selected Languages Display */}
      <div className="flex flex-wrap gap-2">
        {formData.requirements.languages.map((lang, index) => (
          <span 
            key={index} 
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
          >
            {lang}
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  requirements: {
                    ...prev.requirements,
                    languages: prev.requirements.languages.filter((_, i) => i !== index)
                  }
                }));
              }}
              className="hover:text-gray-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelection;