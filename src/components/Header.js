import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  User,
  Settings,
  CreditCard,
  LogOut,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PricingModal from './PricingModal';

const Header = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const { user, organization, logout } = useAuth();
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const userInfo = {
    name: user?.name || user?.email?.split('@')[0] || 'User',
    email: user?.email,
    avatar: getInitials(user?.name),
    plan: organization?.plan || 'free'
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center rounded-lg">
              <img 
                  src="/logo.png" 
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">
              RightCruiter
              </span>
            </Link>
            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Upgrade Button */}
              {userInfo.plan === 'free' && (
                <button
                  onClick={() => setIsPricingOpen(true)}
                  className="hidden md:flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade</span>
                </button>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{userInfo.avatar}</span>
                    </div>
                    <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                      {userInfo.name}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                      <p className="text-sm text-gray-500">{userInfo.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Your Profile</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>

                      {userInfo.plan === 'free' && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsPricingOpen(true);
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-primary hover:bg-primary/5 w-full text-left transition-colors"
                        >
                          <Crown className="w-4 h-4" />
                          <span>Upgrade Plan</span>
                        </button>
                      )}

                      <Link
                        to="/billing"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Billing</span>
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Modal */}
      <PricingModal 
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />
    </>
  );
};

export default Header;