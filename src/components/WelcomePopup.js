import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, X, Globe, Linkedin, AlertCircle } from 'lucide-react';
import { organizationService } from '../services/organizationService';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const WelcomePopup = ({ isOpen, onClose }) => {
  const { organization, user } = useAuth();
  const [formData, setFormData] = useState({
    description: organization?.description || '',
    logo: null,
    logoPreview: null,
    website: organization?.website || '',
    linkedinUrl: organization?.linkedinUrl || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(null);

  if (!isOpen) return null;

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file,
        logoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    if (!validateUrl(formData.website)) {
      setError('Please enter a valid website URL');
      return;
    }
    if (!validateUrl(formData.linkedinUrl)) {
      setError('Please enter a valid LinkedIn URL');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const formDataObj = new FormData();
      formDataObj.append('description', formData.description);
      if (formData.logo) {
        formDataObj.append('logo', formData.logo);
      }
      if (formData.website) {
        formDataObj.append('website', formData.website);
      }
      if (formData.linkedinUrl) {
        formDataObj.append('linkedinUrl', formData.linkedinUrl);
      }
  
      await organizationService.updateOrganization(organization.id, formDataObj);
      onClose();
    } catch (err) {
      setError('Failed to update organization information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Welcome to JobBoard!</h2>
          <p className="text-gray-600 mt-2">
            Let's complete your organization profile to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Logo
            </label>
            <div className="flex items-center justify-center w-full">
              <label className={`flex flex-col items-center justify-center w-full h-40 border-2 ${
                logoError ? 'border-red-300' : 'border-gray-300'
              } border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative`}>
                {formData.logoPreview ? (
                  <img
                    src={formData.logoPreview}
                    alt="Preview"
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={`h-12 w-12 mb-3 ${logoError ? 'text-red-400' : 'text-primary/60'}`} />
                    <p className="text-sm text-gray-500">Click to upload logo</p>
                    <p className="text-xs text-gray-400 mt-1">PNG up to 2MB</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept=".png"
                  onChange={handleLogoChange}
                />
              </label>
            </div>
            {logoError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{logoError}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              rows="4"
              placeholder="Tell us about your organization..."
              required
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WelcomePopup;