import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  SparklesIcon,
  TrophyIcon,
  ClockIcon,
  PlayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

import QuizCard from '../components/quizzes/QuizCard';
import Loading from '../components/common/Loading';
import api from '../services/api';

const Quizzes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('available');

  // Fetch quizzes
  const { data: quizzesData, isLoading, refetch } = useQuery({
    queryKey: ['quizzes', searchTerm, selectedDifficulty, selectedStatus, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (activeTab === 'completed') params.append('completed', 'true');
      if (activeTab === 'pending') params.append('pending', 'true');
      
      const response = await api.get(`/quizzes?${params.toString()}`);
      return response.data;
    }
  });

  // Fetch quiz stats
  const { data: statsData } = useQuery({
    queryKey: ['quiz-stats'],
    queryFn: async () => {
      const response = await api.get('/quizzes/stats');
      return response.data;
    }
  });

  const difficulties = ['all', 'easy', 'medium', 'hard'];
  const statuses = ['all', 'completed', 'not-attempted', 'in-progress'];

  const tabs = [
    { id: 'available', name: 'Available Quizzes', icon: PlayIcon },
    { id: 'completed', name: 'Completed', icon: TrophyIcon },
    { id: 'pending', name: 'AI Generated', icon: SparklesIcon }
  ];

  if (isLoading) {
    return <Loading message="Loading quizzes..." />;
  }

  const quizzes = quizzesData?.quizzes || [];
  const stats = statsData?.stats || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quizzes</h1>
            <p className="text-gray-600">
              Test your knowledge and track your learning progress
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <SparklesIcon className="h-5 w-5" />
            <span>Generate AI Quiz</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrophyIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedQuizzes || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <SparklesIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">AI Generated</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aiGenerated || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
            <FunnelIcon className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
            <FunnelIcon className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      {activeTab === 'available' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Generate AI Quiz</h3>
                <p className="text-purple-100 text-sm">Create quizzes from your course materials</p>
              </div>
              <SparklesIcon className="h-8 w-8 text-purple-100" />
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors"
            >
              Generate Quiz
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Practice Mode</h3>
                <p className="text-green-100 text-sm">Take practice quizzes to improve</p>
              </div>
              <ClockIcon className="h-8 w-8 text-green-100" />
            </div>
            <button className="mt-4 bg-white text-green-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50 transition-colors">
              Start Practice
            </button>
          </div>
        </motion.div>
      )}

      {/* Quizzes Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {quizzes.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {quizzes.length} Quiz{quizzes.length !== 1 ? 'zes' : ''} Found
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <QuizCard quiz={quiz} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'available' && !searchTerm
                ? 'Get started by generating your first AI quiz'
                : 'Try adjusting your search or filters'}
            </p>
            {activeTab === 'available' && !searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span>Generate Your First Quiz</span>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Create Quiz Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate AI Quiz</h3>
            <p className="text-gray-600 mb-4">
              Upload a PDF or select course materials to generate an AI-powered quiz.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                  <option value="20">20 Questions</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Generate Quiz</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
