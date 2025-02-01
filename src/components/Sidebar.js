import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  Settings,
  CreditCard,
  LogOut,
  Network,
  Home,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PricingModal from './PricingModal';
import CreditsDisplay from './CreditsDisplay';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const { user, organization, logout } = useAuth();
  const [credits, setCredits] = useState(0);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  useEffect(() => {
    setCredits(organization?.credits || 0);
  }, [organization?.credits]);

  const userInfo = {
    name: user?.fullName || user?.email?.split('@')[0] || 'User',
    email: user?.email,
    avatar: getInitials(user?.fullName),
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 z-50 w-full bg-white md:hidden border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-gray-900">RightCruiter</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-72 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="hidden md:flex items-center space-x-3 px-6 py-6 border-b border-gray-200">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-gray-900">RightCruiter</span>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/dashboard' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/integrations"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/integrations' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Network className="w-5 h-5" />
              <span>Integrations</span>
            </Link>

            <Link
              to="/settings"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/settings' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>

          {/* Credits Section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Credits Available</span>
                <span className="text-lg font-bold text-gray-900">{credits}</span>
              </div>
              <button
                onClick={() => setIsPricingOpen(true)}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Purchase Credits
              </button>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{userInfo.avatar}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
              </div>
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isDropdownOpen && (
              <div className="mt-2 space-y-1 bg-gray-50 rounded-lg overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 w-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onPurchaseComplete={() => {
          setIsPricingOpen(false);
        }}
      />
    </>
  );
};

export default Sidebar;