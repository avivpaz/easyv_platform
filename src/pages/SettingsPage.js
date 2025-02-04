
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Mail } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useAuth();
    const [profileData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-primary to-primary-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
                    <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1">Settings</h1>
                    <p className="text-sm text-secondary-light">Manage your profile settings</p>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow p-8">
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
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
