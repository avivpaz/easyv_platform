import React, { useState,useEffect } from 'react';
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

const Header = () => {
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
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8  flex items-center justify-center rounded-lg">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-xl font-bold text-gray-900">RightCruiter</span>
              </Link>
              
            {/* After the Home link */}
<Link 
  to="/dashboard" 
  className={`hidden md:flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
    location.pathname === '/dashboard' ? 'text-primary bg-primary/5' : 'text-gray-700 hover:bg-gray-100'
  }`}
>
  <Home className="w-4 h-4" />
  <span>Home</span>
</Link>

<Link 
  to="/integrations" 
  className={`hidden md:flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
    location.pathname === '/integrations' ? 'text-primary bg-primary/5' : 'text-gray-700 hover:bg-gray-100'
  }`}
>
  <Network className="w-4 h-4" />
  <span>Integrations</span>
</Link>
              
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 ml-auto">


              <CreditsDisplay 
                credits={credits}
                onPurchaseClick={() => setIsPricingOpen(true)}
              />
              
              <Link
                to="/settings"
                className={`p-2 rounded-md ${
                  location.pathname === '/settings' ? 'text-primary bg-primary/5' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
              </Link>

              {/* Desktop User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{userInfo.avatar}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{userInfo.name}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-1"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                      <p className="text-sm text-gray-500">{userInfo.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsPricingOpen(true);
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-primary hover:bg-primary/5 w-full text-left"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Purchase Credits</span>
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{userInfo.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                  <p className="text-sm text-gray-500">{userInfo.email}</p>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-2">
              <Link 
                to="/dashboard" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/dashboard' ? 'text-primary bg-primary/5' : 'text-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <Link
                to="/settings"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/settings' ? 'text-primary bg-primary/5' : 'text-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPricingOpen(true);
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-primary w-full text-left"
              >
                <CreditCard className="w-4 h-4" />
                <span>Purchase Credits</span>
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </header>

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

export default Header;