import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BookOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Courses', href: '/courses', icon: AcademicCapIcon },
    { name: 'Quizzes', href: '/quizzes', icon: DocumentTextIcon },
    { name: 'Schedule', href: '/schedule', icon: CalendarIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-700">
        <BookOpenIcon className="h-8 w-8 text-blue-400" />
        <span className="ml-2 text-xl font-bold">StudyMate+</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <div className="flex items-center">
          <ChartBarIcon className="h-5 w-5 text-gray-400" />
          <span className="ml-2 text-sm text-gray-400">AI Powered Learning</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;