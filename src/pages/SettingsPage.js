import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Building2, Upload, Globe, Linkedin, Mail, UserCircle } from 'lucide-react';
import { organizationService } from '../services/organizationService';

const SettingsPage = () => {
    const { user, organization, updateOrganization } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const [orgData, setOrgData] = useState({
    name: organization?.name || '',
    description: organization?.description || '',
    website: organization?.website || '',
    linkedinUrl: organization?.linkedinUrl || '',
    brandColor: organization?.brandColor || '#000000',
    logo: null,
    logoPreview: organization?.logoUrl || null
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Call your user update API here
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('name', orgData.name);
      formData.append('description', orgData.description);
      formData.append('website', orgData.website);
      formData.append('linkedinUrl', orgData.linkedinUrl);
      formData.append('brandColor', orgData.brandColor);
      if (orgData.logo) {
        formData.append('logo', orgData.logo);
      }

      const updatedOrg = await organizationService.updateOrganization(organization.id, formData);
      
      // Update the organization in AuthContext
      updateOrganization(updatedOrg);
      
      setSuccess('Organization details updated successfully');
    } catch (err) {
      setError('Failed to update organization details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOrgData(prev => ({
        ...prev,
        logo: file,
        logoPreview: URL.createObjectURL(file)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center space-x-2`}
              >
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={() => setActiveTab('organization')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'organization'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center space-x-2`}
              >
                <Building2 className="w-4 h-4" />
                <span>Organization Settings</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.fullName}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOrgSubmit} className="space-y-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Logo
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                  For best results, use a 1:1 ratio logo (500x500 recommended)
                  </p>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {orgData.logoPreview ? (
                        <img
                          src={orgData.logoPreview}
                          alt="Organization logo"
                          className="w-full h-full object-contain p-4"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-12 w-12 text-primary/60 mb-3" />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgData.name}
                    onChange={(e) => setOrgData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Color
            </label>
            <div className="relative">
              <div className="flex gap-4">
                <input
                  type="color"
                  value={orgData.brandColor}
                  onChange={(e) => setOrgData(prev => ({ ...prev, brandColor: e.target.value }))}
                  className="h-10 w-20 cursor-pointer border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={orgData.brandColor}
                  onChange={(e) => setOrgData(prev => ({ ...prev, brandColor: e.target.value }))}
                  className="pl-10 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="#000000"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Choose your brand color. This will be used across your organization's profile.
              </p>
            </div>
          </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={orgData.description}
                    onChange={(e) => setOrgData(prev => ({ ...prev, description: e.target.value }))}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                          
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={orgData.website}
                      placeholder="https://yourcompany.com"
                      onChange={(e) => setOrgData(prev => ({ ...prev, website: e.target.value }))}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={orgData.linkedinUrl}
                      placeholder="https://linkedin.com/company/yourcompany"
                      onChange={(e) => setOrgData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Organization Settings'}
                </button>
                <div className=''>
            {success && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
                {success}
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            </div>
              </form>
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  );
};  

export default SettingsPage;