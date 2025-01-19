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
      {/* Mobile Menu Button - Fixed at the top */}
      <div className="fixed top-0 left-0 z-50 w-full bg-white md:hidden border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-gray-900">RightCruiter</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar - Hidden on mobile unless menu is open */}
      <div className="fixed top-0 left-0 z-50 w-full bg-white md:hidden border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-gray-900">RightCruiter</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-primary transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="hidden md:flex items-center space-x-2 px-6 py-5 border-b border-white/10">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white">RightCruiter</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/dashboard' 
                  ? 'bg-white text-primary' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/integrations"
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/integrations' 
                  ? 'bg-white text-primary' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Network className="w-5 h-5" />
              <span>Integrations</span>
            </Link>

            <Link
              to="/settings"
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/settings' 
                  ? 'bg-white text-primary' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </nav>

          {/* Credits and User Profile */}
          <div className="mt-auto">
            <div className="px-3 py-4 border-t border-white/10">
              <CreditsDisplay 
                credits={credits}
                onPurchaseClick={() => setIsPricingOpen(true)}
              />
            </div>
            
            <div className="border-t border-white/10 p-4">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 w-full"
              >
                <div className="w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{userInfo.avatar}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{userInfo.name}</p>
                  <p className="text-xs text-white/70 truncate">{userInfo.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="mt-2 space-y-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-white hover:bg-white/10 w-full rounded-md text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
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