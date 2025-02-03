import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Building2, Upload, Globe, Linkedin, Mail, UserCircle } from 'lucide-react';
import { organizationService } from '../services/organizationService';
import { useNavigate, useLocation } from 'react-router-dom';

const SettingsPage = () => {
    const { user, organization, updateOrganization } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get the active tab from the URL or default to 'profile'
    const getInitialTab = () => {
        const path = location.pathname;
        console.log('Current path:', path); // For debugging
        return path.includes('organization') ? 'organization' : 'profile';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);
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

    // Update URL when tab changes
    const handleTabChange = (tab) => {
        const baseUrl = '/settings';
        const newUrl = tab === 'profile' ? baseUrl : `${baseUrl}/organization`;
        navigate(newUrl);
        setActiveTab(tab);
    };

    // Update active tab when URL changes
    useEffect(() => {
        const tab = getInitialTab();
        setActiveTab(tab);
        console.log('Current tab:', tab); // For debugging
    }, [location.pathname]);

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
        <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-primary-light">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
    <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1">Settings</h1>
    <p className="text-sm text-secondary-light">Manage your profile and organization settings</p>
  </div>
</div>
        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Improved Tabs */}
                <div className="bg-gray-50 border-b border-gray-200">
                    <nav className="flex space-x-1 px-4 py-3">
                        <button
                            onClick={() => handleTabChange('profile')}
                            className={`flex-1 relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 
                                ${activeTab === 'profile' 
                                    ? 'bg-white text-primary shadow-sm' 
                                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                                } flex items-center justify-center gap-2`}
                        >
                            <User className={`w-4 h-4 transition-colors duration-200 
                                ${activeTab === 'profile' ? 'text-primary' : 'text-gray-400'}`} 
                            />
                            <span>Profile Settings</span>
                        </button>
                        <button
                            onClick={() => handleTabChange('organization')}
                            className={`flex-1 relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 
                                ${activeTab === 'organization' 
                                    ? 'bg-white text-primary shadow-sm' 
                                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                                } flex items-center justify-center gap-2`}
                        >
                            <Building2 className={`w-4 h-4 transition-colors duration-200 
                                ${activeTab === 'organization' ? 'text-primary' : 'text-gray-400'}`} 
                            />
                            <span>Organization Settings</span>
                        </button>
                    </nav>
                </div>


                <div className="p-8">
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
                          {/* Organization Name */}
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

                          {/* Logo and Brand Color Grid */}
                          <div className="grid grid-cols-2 gap-6">
                              {/* Logo Upload */}
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Logo
                                  </label>
                                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                      {orgData.logoPreview ? (
                                          <img
                                              src={orgData.logoPreview}
                                              alt="Organization logo"
                                              className="h-full w-full object-contain p-2"
                                          />
                                      ) : (
                                          <div className="flex flex-col items-center justify-center">
                                              <Upload className="h-6 w-6 text-primary/60 mb-1" />
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
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Brand Color
                                  </label>
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
                                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                                          placeholder="#000000"
                                          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                      />
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                      Choose your brand color. This will be used across your organization's profile.
                                  </p>
                              </div>
                          </div>

                          {/* Description */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Description
                              </label>
                              <textarea
                                  value={orgData.description}
                                  onChange={(e) => setOrgData(prev => ({ ...prev, description: e.target.value }))}
                                  rows="4"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                                  placeholder="Tell us about your organization, its mission, and what makes it unique..."
                                  required
                              />
                          </div>
                          
                          {/* Website */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Website
                              </label>
                              <div className="relative">
                                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                  <input
                                      type="url"
                                      value={orgData.website}
                                      onChange={(e) => setOrgData(prev => ({ ...prev, website: e.target.value }))}
                                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                                      placeholder="Enter your organization's website URL"
                                  />
                              </div>
                          </div>

                          {/* LinkedIn URL */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                  LinkedIn URL
                              </label>
                              <div className="relative">
                                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                  <input
                                      type="url"
                                      value={orgData.linkedinUrl}
                                      onChange={(e) => setOrgData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                                      placeholder="Enter your organization's LinkedIn page URL"
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
                      </form>
                        )}
                        
                        {(success || error) && (
                            <div className="mt-4">
                                {success && (
                                    <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                                        {success}
                                    </div>
                                )}
                                
                                {error && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;