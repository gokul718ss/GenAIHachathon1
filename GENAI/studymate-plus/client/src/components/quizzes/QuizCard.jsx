import React from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const QuizCard = ({ quiz }) => {
  const {
    _id,
    title,
    description,
    questions = [],
    difficulty,
    totalPoints,
    passingScore,
    attempts = [],
    course,
    generatedBy,
    createdAt
  } = quiz;

  // Get user's best score
  const bestScore = attempts.length > 0 
    ? Math.max(...attempts.map(a => a.percentage))
    : null;

  const difficultyColors = {
    'easy': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'hard': 'bg-red-100 text-red-800'
  };

  const statusColor = bestScore >= passingScore ? 'text-green-600' : 'text-gray-600';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              {generatedBy === 'ai' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  AI Generated
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {course?.title || 'General Quiz'}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[difficulty] || 'bg-gray-100 text-gray-800'}`}>
            {difficulty}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Quiz Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            <span>{questions.length} questions</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{totalPoints} points</span>
          </div>
        </div>

        {/* Progress/Score */}
        {bestScore !== null ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Best Score</span>
              <span className={`text-sm font-medium ${statusColor}`}>
                {bestScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  bestScore >= passingScore ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${bestScore}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <PlayIcon className="h-4 w-4 mr-1" />
              <span>Not attempted yet</span>
            </div>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>
            Passing: {passingScore}%
          </span>
          <span>
            {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link 
            to={`/quizzes/${_id}`}
            className="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            {bestScore !== null ? 'Retake Quiz' : 'Start Quiz'}
          </Link>
          {bestScore !== null && (
            <Link 
              to={`/quizzes/${_id}/results`}
              className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;