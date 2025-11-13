import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UsersIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

const CourseCard = ({ course }) => {
  const {
    _id,
    title,
    description,
    instructor,
    category,
    difficulty,
    enrolledStudents = [],
    createdAt
  } = course;

  const difficultyColors = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              by {instructor}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[difficulty] || 'bg-gray-100 text-gray-800'}`}>
            {difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span>{enrolledStudents.length} students</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {category}
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link 
            to={`/courses/${_id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Course
          </Link>
          <button className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <AcademicCapIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
