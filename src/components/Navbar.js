import React from 'react';

const Navbar = ({ onLogout }) => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-gray-900">Admin Dashboard</div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;