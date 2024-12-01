import React, { useState, useCallback, useEffect,locationInputRef,useRef } from 'react';
import { X, Plus, Building2, MapPin, Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { jobService } from '../services/jobService';
import debounce from 'lodash/debounce';
const GOOGLE_MAPS_API_KEY = 'AIzaSyBAKK100KsCI3XMAdDWK_I7jp1RHJN185s'
const GOOGLE_MAPS_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;

const CreateJobModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
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
      // Script already exists and is loaded
      setIsGoogleLoaded(true);
    } else {
      // Script exists but hasn't loaded yet
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
    if (isGoogleLoaded && locationInputRef.current && isOpen) {
      try {
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
  }, [isGoogleLoaded, isOpen]);


  const debouncedGenerate = useCallback(
    debounce(async (title) => {
      if (title.length < 5) return;
      
      setIsGenerating(true);
      setError(null);
      
      try {
        const generatedData = await jobService.generateJobDetails(title);
        setFormData(prev => ({
          ...prev,
          description: generatedData.description || prev.description,
          requiredSkills: generatedData.requiredSkills || prev.requiredSkills,
          niceToHaveSkills: generatedData.niceToHaveSkills || prev.niceToHaveSkills
        }));
      } catch (err) {
        setError('Failed to generate job details. Please fill in manually.');
      } finally {
        setIsGenerating(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    return () => {
      debouncedGenerate.cancel();
    };
  }, [debouncedGenerate]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData(prev => ({ ...prev, title: newTitle }));
    debouncedGenerate(newTitle);
  };

  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobService.createJob({
        ...formData,
        status: saveAsDraft ? 'draft' : 'active'
      });
      
      setFormData({
        title: '',
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Create New Job</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isGenerating 
                ? "✨ AI is generating job details..."
                : "Enter a job title to automatically generate details"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto p-6 space-y-8">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            {/* Basic Information Section */}
            <section>
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    Job Title
                    {isGenerating && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                  {formData.title.length > 0 && formData.title.length < 5 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Keep typing to generate job details automatically
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                    placeholder={isGenerating ? "Generating description..." : "Job description will be generated automatically"}
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </section>

            {/* Job Details Section */}
            <section>
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                Job Details
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
                  <select
                    value={formData.workType}
                    onChange={(e) => setFormData(prev => ({ ...prev, workType: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isGenerating}
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isGenerating}
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
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={isGoogleLoaded ? "Start typing a city name..." : "Loading location search..."}
          disabled={isGenerating || !isGoogleLoaded}
        />
      </div>
              </div>
            </section>

            {/* Skills Section */}
            <section>
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                <GraduationCap className="h-5 w-5 mr-2 text-blue-500" />
                Skills & Qualifications
              </h3>

              <div className="space-y-6">
                {/* Required Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInputs.required}
                      onChange={(e) => setSkillInputs(prev => ({ ...prev, required: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add or edit required skills"
                      disabled={isGenerating}
                    />
                    <button
                      type="button"
                      onClick={() => addSkill('required')}
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 disabled:opacity-50"
                      disabled={isGenerating}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {formData.requiredSkills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill('required', skill)}
                          className="hover:text-blue-900"
                          disabled={isGenerating}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Nice-to-have Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nice-to-have Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInputs.niceToHave}
                      onChange={(e) => setSkillInputs(prev => ({ ...prev, niceToHave: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('niceToHave'))}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add or edit nice-to-have skills"
                      disabled={isGenerating}
                    />
                    <button
                      type="button"
                      onClick={() => addSkill('niceToHave')}
                      className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 disabled:opacity-50"
                      disabled={isGenerating}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {formData.niceToHaveSkills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill('niceToHave', skill)}
                          className="hover:text-emerald-900"
                          disabled={isGenerating}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white"
          >
            Cancel
          </button>

          <button
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading || isGenerating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Job'}
          </button>
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
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
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