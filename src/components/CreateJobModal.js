import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Building2, MapPin, Sparkles, Plus, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import SkillsSection from './createModalComponents/SkillsSection';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;

const CreateJobModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialDescription = '', 
  autoSubmit = false 
}) => {
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isOpen && initialDescription) {
      setFormData(prev => ({
        ...prev,
        shortDescription: initialDescription
      }));
      
      if (autoSubmit) {
        generateJobDetails(initialDescription);
      }
    }
  }, [isOpen, initialDescription, autoSubmit]);

  const loadingMessages = [
    "Crafting the perfect job post ✨",
    "Sprinkling some magic dust 🪄",
    "Making your job stand out 🌟",
    "Adding that special touch ✨"
  ];
  
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  
  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (isOpen) {
      // Save current scroll position and add scroll lock
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position and remove scroll lock
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }

    return () => {
      // Cleanup - ensure scroll is restored when component unmounts
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);
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


  const generateJobDetails = async (description = null) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const descriptionToUse = description;
      const generatedData = await jobService.generateJobDetails(descriptionToUse);
      setFormData(prev => ({
        ...prev,
        title: generatedData.title || prev.title,
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
    
    // If not authenticated, show login modal and save form data
    if (!isAuthenticated) {
      setPendingSubmission({
        ...formData,
        status: 'active'
      });
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    try {
      await submitJob(formData);
    } catch (err) {
      setError(err.message || 'Failed to create job.');
    } finally {
      setLoading(false);
    }
  };

  const submitJob = async (jobData) => {
    try {
      await jobService.createJob({
        ...jobData,
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
      throw err;
    }
  };
  
  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    if (pendingSubmission) {
      setLoading(true);
      try {
        await submitJob(pendingSubmission);
        setPendingSubmission(null);
      } catch (err) {
        setError(err.message || 'Failed to create job.');
      } finally {
        setLoading(false);
      }
    }
  }
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about the role you're hiring for</label>
        <div className="relative">
          <textarea
            required
            value={formData.shortDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
            rows={6}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
            placeholder="Describe the role you're looking to fill. Include key responsibilities, requirements, and what makes this position unique. Our AI will generate a comprehensive job post based on your description."
          />
          <p className="mt-1.5 text-sm text-gray-500">
            Our AI will generate a job title and comprehensive description based on your input
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
     <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            title: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)
          }))}
          className="text-lg font-semibold text-gray-900 w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Here’s what we’ve got so far! Edit or add more details about the role if needed</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={6}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
          />
      </div>

      <SkillsSection
        type="required"
        skills={formData.requiredSkills}
        onAddSkill={() => addSkill('required')}
        onRemoveSkill={(skill) => removeSkill('required', skill)}
        onReorderSkills={(newSkills) => setFormData(prev => ({...prev, requiredSkills: newSkills}))}
        inputValue={skillInputs.required}
        onInputChange={(value) => setSkillInputs(prev => ({ ...prev, required: value }))}
      />

      <SkillsSection
        type="niceToHave"
        skills={formData.niceToHaveSkills}
        onAddSkill={() => addSkill('niceToHave')}
        onRemoveSkill={(skill) => removeSkill('niceToHave', skill)}
        onReorderSkills={(newSkills) => setFormData(prev => ({...prev, niceToHaveSkills: newSkills}))}
        inputValue={skillInputs.niceToHave}
        onInputChange={(value) => setSkillInputs(prev => ({ ...prev, niceToHave: value }))}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Where will the work happen?</label>
          <select
            value={formData.workType}
            onChange={(e) => {
              const newWorkType = e.target.value;
              setFormData(prev => ({ 
                ...prev, 
                workType: newWorkType,
                location: newWorkType === 'remote' ? '' : prev.location 
              }));
            }}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors"
          >
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
            <option value="onsite">In Office</option>
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

        {formData.workType !== 'remote' && (
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
        )}
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
          {isAuthenticated && (
    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
      <X className="h-5 w-5 text-gray-500" />
    </button>
  )}
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
        

            {currentStep === 1 && (
              <button
              onClick={() => generateJobDetails(formData.shortDescription)}
              disabled={!formData.shortDescription || isGenerating}
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
                disabled={loading || (formData.workType !== 'remote' && !formData.location)}
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
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingSubmission(null);
        }}
        onSuccess={handleLoginSuccess}
      />
      {/* Loading Overlay */}
      {(loading || isGenerating) && (
         <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
         <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg">
           <div className="flex items-center gap-3">
             <Loader2 className="h-5 w-5 animate-spin text-primary" />
             <Sparkles className="h-5 w-5 animate-pulse text-yellow-400" />
           </div>
           <span className="text-base font-medium text-gray-700 animate-fade-in">
             {loading ? 'Creating your job...' : loadingMessages[loadingMessageIndex]}
           </span>
         </div>
       </div>
      )}
    </div>
  );
};

export default CreateJobModal;
