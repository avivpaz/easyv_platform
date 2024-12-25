import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, X, Globe, Linkedin, AlertCircle, Building2 } from 'lucide-react';
import { organizationService } from '../services/organizationService';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const WelcomePopup = ({ isOpen, onClose }) => {
  const { organization, updateOrganization } = useAuth();
  const [formData, setFormData] = useState({
    name: organization?.name || 'My Company',
    description: organization?.description || '',
    logo: null,
    logoPreview: null,
    website: organization?.website || 'https://www.rightcruiter.com/',
    linkedinUrl: organization?.linkedinUrl || 'https://linkedin.com/company/yourcompany',
    brandColor: organization?.brandColor || '#2c7be2'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be less than 2MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        logo: file,
        logoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] && key !== 'logoPreview') {
          formDataObj.append(key, formData[key]);
        }
      });

      const updatedOrganization = await organizationService.updateOrganization(
        organization.id, 
        formDataObj
      );
      
      updateOrganization(updatedOrganization);
      onClose();
    } catch (err) {
      setError('Failed to update organization settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl">
        <div className="bg-white rounded-xl w-full h-[calc(100vh-2rem)] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-b from-white to-gray-50 z-10 pt-6 px-8 border-b">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Welcome to RightCruiter!</h2>
              </div>
              <p className="text-gray-600 text-base max-w-sm mx-auto">
                Let's set up your organization in just a minute
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6 pb-32">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <div className="mt-1 relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
              </div>

              {/* Logo Upload and Brand Color Container */}
              <div className="grid grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    {formData.logoPreview ? (
                      <img 
                        src={formData.logoPreview} 
                        alt="Logo preview" 
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-6 w-6 text-primary mb-1" />
                        <p className="text-sm text-gray-600">Click to upload logo</p>
                        <p className="text-xs text-gray-400">PNG up to 2MB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".png"
                      onChange={handleLogoChange}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                                      Use a square logo (1:1 ratio) for best results
                                  </p>
                </div>

                {/* Brand Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Brand Color
                  </label>
                  <div className="mt-1 flex gap-4">
                    <input
                      type="color"
                      value={formData.brandColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                      className="h-10 w-20 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={formData.brandColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded-lg p-2"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose your brand color. This will be used across your organization's profile.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg p-2 h-32"
                  placeholder="Tell us about your organization, its mission, and what makes it unique..."
                  required
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <div className="mt-1 relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2"
                    placeholder="Enter your organization's website URL"
                  />
                </div>
              </div>

              {/* LinkedIn URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  LinkedIn URL
                </label>
                <div className="mt-1 relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2"
                    placeholder="Enter your organization's LinkedIn page URL"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="fixed bottom-0 left-0 right-0 bg-white px-8 py-4 border-t max-w-3xl mx-auto">
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
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save and Continue'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;