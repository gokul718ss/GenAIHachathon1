import React from 'react';

const Loading = ({ message = 'Loading...', size = 'default' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="relative mb-4">
          {/* Spinning circle */}
          <div 
            className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto ${sizeClasses[size]}`}
          ></div>
          
          {/* StudyMate+ logo in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-blue-600 font-bold text-xs">S+</div>
          </div>
        </div>
        
        <p className="text-gray-600 font-medium">{message}</p>
        
        {/* Optional loading dots */}
        <div className="flex justify-center space-x-1 mt-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
