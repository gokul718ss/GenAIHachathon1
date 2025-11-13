import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useSocket } from '../../hooks/useSocket';
import { 
  BellIcon, 
  UserCircleIcon, 
  Bars3Icon 
} from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useAuth();
  const { notifications, isConnected } = useSocket();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button className="lg:hidden">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            StudyMate+
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <BellIcon className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {user?.name}
              </span>
              <span className="text-xs text-gray-500">
                {user?.email}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 ml-4"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;