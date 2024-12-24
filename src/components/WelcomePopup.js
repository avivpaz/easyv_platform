import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, X, Globe, Linkedin, AlertCircle,Building2 } from 'lucide-react';
import { organizationService } from '../services/organizationService';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const WelcomePopup = ({ isOpen, onClose }) => {
  const { organization, user, updateOrganization } = useAuth();
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    description: organization?.description || '',
    logo: null,
    logoPreview: null,
    website: organization?.website || '',
    linkedinUrl: organization?.linkedinUrl || '',
    brandColor: organization?.brandColor || '#000000'
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

  const validateHexColor = (color) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    if (!formData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    if (!validateUrl(formData.website)) {
      setError('Please enter a valid website URL');
      return;
    }
    if (!validateUrl(formData.linkedinUrl)) {
      setError('Please enter a valid LinkedIn URL');
      return;
    }
    if (!validateHexColor(formData.brandColor)) {
      setError('Please enter a valid hex color code');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('brandColor', formData.brandColor);
      if (formData.logo) {
        formDataObj.append('logo', formData.logo);
      }
      if (formData.website) {
        formDataObj.append('website', formData.website);
      }
      if (formData.linkedinUrl) {
        formDataObj.append('linkedinUrl', formData.linkedinUrl);
      }
  
      const updatedOrganization = await organizationService.updateOrganization(organization.id, formDataObj);
      
      // Update the auth context with the new organization data
      updateOrganization(updatedOrganization);
      
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
      <div className="relative w-full max-w-3xl">
        <div className="bg-white rounded-xl w-full h-[calc(100vh-2rem)] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 pt-6 px-8 border-b">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
  
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Welcome to RightCruiter!</h2>
              <p className="text-gray-600 mt-2">
                1 Minute and you are up and running!
              </p>
            </div>
          </div>
  
          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Enter your organization name"
                  required
                />
              </div>
            </div>
  
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Logo
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    {formData.logoPreview ? (
                      <img
                        src={formData.logoPreview}
                        alt="Preview"
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-12 w-12 mb-3 text-primary/60" />
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
              </div>
  
              {/* Brand Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Color <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="flex gap-4">
                    <input
                      type="color"
                      value={formData.brandColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                      className="h-10 w-20 cursor-pointer border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={formData.brandColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                      className="pl-10 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="#000000"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
  
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your organization to attract the right candidates <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                rows="4"
                placeholder="Tell us about your organization..."
                required
              />
            </div>
  
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add your website for candidates to learn more <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>
  
              {/* LinkedIn URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Link your LinkedIn profile for additional credibility<span className="text-gray-500 text-xs"> (optional)</span>
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
            </div>
  
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
  
            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white pt-4 border-t mt-auto">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Set Up Later
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save and Continue'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  
};

export default WelcomePopup;