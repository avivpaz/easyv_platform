import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Building2, MapPin, Briefcase, Plus, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { jobService } from '../services/jobService';
import debounce from 'lodash/debounce';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBAKK100KsCI3XMAdDWK_I7jp1RHJN185s';
const GOOGLE_MAPS_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;

const CreateJobModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    requiredSkills: [],
    niceToHaveSkills: [],
    status: 'active',
    location: '',
    workType: 'hybrid',
    employmentType: 'full-time'
  });
  
  const [skillInputs, setSkillInputs] = useState({ required: '', niceToHave: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

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
        console.error('Error initializing Google Places Autocomplete:', error);
      }
    }
  }, [isGoogleLoaded]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (currentStep === 3 && isOpen) {
      const cleanup = initializeGooglePlaces();
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [currentStep, isOpen, initializeGooglePlaces]);

  const generateJobDetails = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedData = await jobService.generateJobDetails(formData.title, formData.shortDescription);
      setFormData(prev => ({
        ...prev,
        description: generatedData.description || prev.description,
        requiredSkills: generatedData.requiredSkills || prev.requiredSkills,
        niceToHaveSkills: generatedData.niceToHaveSkills || prev.niceToHaveSkills
      }));
      setCurrentStep(2);
    } catch (err) {
      setError('Failed to generate job details. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addSkill = (type) => {
    const input = skillInputs[type].trim();
    if (input) {
      const field = type === 'required' ? 'requiredSkills' : 'niceToHaveSkills';
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], input]
      }));
      setSkillInputs(prev => ({ ...prev, [type]: '' }));
    }
  };

  const removeSkill = (type, skillToRemove) => {
    const field = type === 'required' ? 'requiredSkills' : 'niceToHaveSkills';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobService.createJob({
        ...formData,
        status: 'active'
      });
      
      setFormData({
        title: '',
        shortDescription: '',
        description: '',
        requiredSkills: [],
        niceToHaveSkills: [],
        status: 'active',
        location: '',
        workType: 'hybrid',
        employmentType: 'full-time'
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Which role are you hiring for?</label>
            <input
      type="text"
      required
      value={formData.title}
      onChange={(e) => setFormData(prev => ({ 
        ...prev, 
        title: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)
      }))}
      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
      placeholder="e.g. Senior Frontend Developer"
    />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Can you share a few key points about this role?</label>
        <div className="relative">
        <textarea
  required
  value={formData.shortDescription}
  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
  rows={4}
  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
  placeholder="Share a few key points about the role..."
/>
          <p className="mt-1.5 text-sm text-gray-500">
Our AI will turn your input into a comprehensive and professional job description
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={6}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
          />
      </div>

      {/* Required Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What are the must-have skills for this role?</label>
        <div className="flex gap-2 mb-2">
              <input
        type="text"
        value={skillInputs.required}
        onChange={(e) => setSkillInputs(prev => ({ ...prev, required: e.target.value }))}
        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
        placeholder="Add required skills"
      />
          <button
            type="button"
            onClick={() => addSkill('required')}
            className="p-2.5 bg-primary/5 text-primary rounded-xl hover:bg-primary/10"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border border-gray-100">
          {formData.requiredSkills.map((skill, index) => (
            <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill('required', skill)}
                className="hover:text-primary-dark"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Nice-to-have Skills */}
      <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Are there any bonus skills you'd like to highlight?</label>
  <div className="flex gap-2 mb-2">
    <input
      type="text"
      value={skillInputs.niceToHave}
      onChange={(e) => setSkillInputs(prev => ({ ...prev, niceToHave: e.target.value }))}
      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('niceToHave'))}
      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
      placeholder="Add nice-to-have skills"
    />
    <button
      type="button"
      onClick={() => addSkill('niceToHave')}
      className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200"
    >
      <Plus className="h-5 w-5" />
    </button>
  </div>
  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border border-gray-100">
    {formData.niceToHaveSkills.map((skill, index) => (
      <span
        key={index}
        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
      >
        {skill}
        <button
          type="button"
          onClick={() => removeSkill('niceToHave', skill)}
          className="hover:text-gray-900"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    ))}
  </div>
</div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Where will the work happen?</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">What’s the employment type?</label>
          <select
            value={formData.employmentType}
            onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
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
            Where is the job located? 
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Create New Job</h2>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStep} of 3: {
                currentStep === 1 ? "The Basics" :
                currentStep === 2 ? "Define the Role" :
                "Work Preferences"
              }
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1">
          <div 
            className="bg-primary h-1 transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto p-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex justify-between">
          <div>
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white"
            >
              Cancel
            </button>

            {currentStep === 1 && (
              <button
                onClick={generateJobDetails}
                disabled={!formData.title || !formData.shortDescription || isGenerating}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}

            {currentStep === 2 && (
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!formData.description || formData.requiredSkills.length === 0}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 flex items-center gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.location}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Job'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {(loading || isGenerating) && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-gray-700">
              {loading ? 'Publishing job...' : 'Generating details...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateJobModal;