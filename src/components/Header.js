// components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Settings,
  CreditCard,
  LogOut,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PricingModal from './PricingModal';
import CreditsDisplay from './CreditsDisplay';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    credits: organization?.credits || 0
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

  const handleNavigation = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
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
              <CreditsDisplay 
                credits={userInfo.credits}
                onPurchaseClick={() => setIsPricingOpen(true)}
              />

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
                      <p className="text-sm text-primary mt-1">
                        {userInfo.credits} CV Credits Available
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => handleNavigation('/settings')}
                        className={`flex items-center space-x-3 px-4 py-2 text-sm w-full text-left ${
                          location.pathname === '/settings'
                          ? 'text-primary bg-primary/5' 
                          : 'text-gray-700 hover:bg-primary/5'
                        } transition-colors`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsPricingOpen(true);
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-primary hover:bg-primary/5 w-full text-left transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Purchase Credits</span>
                      </button>

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
        onPurchaseComplete={() => {
          setIsPricingOpen(false);
          // Refresh organization data to update credits
        }}
      />
    </>
  );
};

export default Header;