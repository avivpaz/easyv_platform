import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  X, MapPin, Plus, Loader2, Check,
  Building2, Briefcase, Globe
} from 'lucide-react';
import { jobService } from '../services/jobService';
import SkillsSection from './createModalComponents/SkillsSection';
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;

const EditJobModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  job
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    niceToHaveSkills: [],
    location: '',
    workType: 'hybrid',
    employmentType: 'full-time'
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('details'); // details, skills, work
  const [isDirty, setIsDirty] = useState(false);
  
  // Google Maps Places Autocomplete
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Initialize form data when job prop changes
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requiredSkills: job.requiredSkills || [],
        niceToHaveSkills: job.niceToHaveSkills || [],
        location: job.location || '',
        workType: job.workType || 'hybrid',
        employmentType: job.employmentType || 'full-time'
      });
    }
  }, [job]);

  // Track form changes
  useEffect(() => {
    if (job) {
      const isChanged = 
        formData.title !== job.title ||
        formData.description !== job.description ||
        formData.location !== job.location ||
        formData.workType !== job.workType ||
        formData.employmentType !== job.employmentType ||
        JSON.stringify(formData.requiredSkills) !== JSON.stringify(job.requiredSkills) ||
        JSON.stringify(formData.niceToHaveSkills) !== JSON.stringify(job.niceToHaveSkills);
      
      setIsDirty(isChanged);
    }
  }, [formData, job]);

  // Scroll lock management
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Google Places initialization
  const initializeGooglePlaces = useCallback(() => {
    if (isGoogleLoaded && locationInputRef.current) {
      try {
        if (autocompleteRef.current) {
          window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(locationInputRef.current, {
          types: ['(cities)']
        });

        const placeChangedListener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (place.address_components) {
            let city = '';
            let country = '';

            place.address_components.forEach(component => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('country')) {
                country = component.long_name;
              }
            });

            const formattedLocation = city && country ? `${city}, ${country}` : place.formatted_address;
            setFormData(prev => ({ ...prev, location: formattedLocation }));
          }
        });

        return () => {
          if (placeChangedListener) {
            window.google.maps.event.removeListener(placeChangedListener);
          }
        };
      } catch (error) {
        console.error('Error initializing Google Places:', error);
      }
    }
  }, [isGoogleLoaded]);

  // Load Google Maps script
  useEffect(() => {
    if (activeSection === 'work') {
      let scriptElement = document.querySelector(`script[src="${GOOGLE_MAPS_URL}"]`);
      
      const handleScriptLoad = () => {
        setIsGoogleLoaded(true);
      };

      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.src = GOOGLE_MAPS_URL;
        scriptElement.async = true;
        scriptElement.defer = true;
        scriptElement.addEventListener('load', handleScriptLoad);
        document.head.appendChild(scriptElement);
      } else if (window.google?.maps) {
        setIsGoogleLoaded(true);
      } else {
        scriptElement.addEventListener('load', handleScriptLoad);
      }

      return () => {
        if (scriptElement) {
          scriptElement.removeEventListener('load', handleScriptLoad);
        }
        if (autocompleteRef.current) {
          window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        }
      };
    }
  }, [activeSection]);

  // Initialize Places when on work section
  useEffect(() => {
    if (activeSection === 'work' && isOpen) {
      const cleanup = initializeGooglePlaces();
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [activeSection, isOpen, initializeGooglePlaces]);

  const addSkill = (type) => {
    const input = skillInput.trim();
    if (input) {
      const field = type === 'required' ? 'requiredSkills' : 'niceToHaveSkills';
      if (!formData[field].includes(input)) {
        setFormData(prev => ({
          ...prev,
          [field]: [...prev[field], input]
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (type, skillToRemove) => {
    const field = type === 'required' ? 'requiredSkills' : 'niceToHaveSkills';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      await jobService.updateJob(job._id, formData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const renderDetails = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            title: e.target.value
          }))}
          className="text-lg font-semibold text-gray-900 w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={12}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
        />
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <SkillsSection
        type="required"
        skills={formData.requiredSkills}
        onAddSkill={() => addSkill('required')}
        onRemoveSkill={(skill) => removeSkill('required', skill)}
        onReorderSkills={(newSkills) => setFormData(prev => ({...prev, requiredSkills: newSkills}))}
        inputValue={skillInput}
        onInputChange={setSkillInput}
      />
  
      <SkillsSection
        type="niceToHave"
        skills={formData.niceToHaveSkills}
        onAddSkill={() => addSkill('niceToHave')}
        onRemoveSkill={(skill) => removeSkill('niceToHave', skill)}
        onReorderSkills={(newSkills) => setFormData(prev => ({...prev, niceToHaveSkills: newSkills}))}
        inputValue={skillInput}
        onInputChange={setSkillInput}
      />
    </div>
  );

  const renderWork = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
          <select
            value={formData.workType}
            onChange={(e) => setFormData(prev => ({ ...prev, workType: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          >
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
            <option value="onsite">In-Office</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
          <select
            value={formData.employmentType}
            onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="h-4 w-4 inline mr-1 text-gray-400" />
            Location
          </label>
          <input
            ref={locationInputRef}
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
            placeholder={isGoogleLoaded ? "Start typing a city name..." : "Loading location search..."}
          />
        </div>
      </div>
    </div>
  );

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Edit Job</h2>
            <p className="text-sm text-gray-500 mt-1">Make changes to your job posting</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveSection('details')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase className="h-4 w-4 inline mr-2" />
            Job Details
          </button>
          <button
            onClick={() => setActiveSection('skills')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'skills'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe className="h-4 w-4 inline mr-2" />
            Skills
          </button>
          <button
            onClick={() => setActiveSection('work')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'work'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="h-4 w-4 inline mr-2" />
            Work Preferences
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto p-6">
          {activeSection === 'details' && renderDetails()}
          {activeSection === 'skills' && renderSkills()}
          {activeSection === 'work' && renderWork()}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {isDirty && 'You have unsaved changes'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !isDirty || !formData.title || !formData.description}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditJobModal;