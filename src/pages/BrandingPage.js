import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Globe, Linkedin, Building2, Edit3 } from 'lucide-react';
import { organizationService } from '../services/organizationService';

const BrandingPage = () => {
    const { organization, updateOrganization } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [orgData, setOrgData] = useState({
        name: organization?.name || '',
        description: organization?.description || '',
        website: organization?.website || '',
        linkedinUrl: organization?.linkedinUrl || '',
        brandColor: organization?.brandColor || '#000000',
        logo: null,
        logoPreview: organization?.logoUrl || null
    });

    const handleSubmit = async (e) => {
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
            updateOrganization(updatedOrg);
            setSuccess('Brand details updated successfully');
        } catch (err) {
            setError('Failed to update brand details');
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
            <div className="bg-gradient-to-r from-primary to-primary-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
                    <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1">Brand Portal</h1>
                    <p className="text-sm text-secondary-light">Manage your organization's identity and presence</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Organization Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Organization Name
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={orgData.name}
                                    onChange={(e) => setOrgData(prev => ({ ...prev, name: e.target.value }))}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <div className="relative">
                                <Edit3 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <textarea
                                    value={orgData.description}
                                    onChange={(e) => setOrgData(prev => ({ ...prev, description: e.target.value }))}
                                    rows="4"
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                                    placeholder="Tell us about your organization, its mission, and what makes it unique..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Logo and Brand Color Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Logo
                                </label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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
                            {loading ? 'Saving...' : 'Save Brand Settings'}
                        </button>

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
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BrandingPage;