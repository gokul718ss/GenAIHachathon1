import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  AcademicCapIcon,
  ClockIcon,
  DocumentTextIcon,
  TrophyIcon,
  CalendarIcon,
  ChartBarIcon,
  BookOpenIcon,
  BellIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../hooks/useAuth.js';
import { useSocket } from '../hooks/useSocket';
import Loading from '../components/common/Loading';
import CourseCard from '../components/courses/CourseCard';
import QuizCard from '../components/quizzes/QuizCard';
import Calendar from '../components/schedule/Calendar';
import AIAssistant from '../components/ai/AIAssistant';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { socket, notifications } = useSocket();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [coursesRes, quizzesRes, scheduleRes, statsRes] = await Promise.all([
        api.get('/courses?enrolled=true&limit=4'),
        api.get('/quizzes?recent=true&limit=4'),
        api.get('/schedules/upcoming?limit=5'),
        api.get('/users/stats')
      ]);

      return {
        courses: coursesRes.data.courses,
        recentQuizzes: quizzesRes.data.quizzes,
        upcomingEvents: scheduleRes.data.events,
        stats: statsRes.data.stats
      };
    }
  });

  if (isLoading) {
    return <Loading />;
  }

  const { courses, recentQuizzes, upcomingEvents, stats } = dashboardData || {};

  // Stats cards data
  const statsCards = [
    {
      title: 'Courses Enrolled',
      value: stats?.coursesEnrolled || 0,
      icon: BookOpenIcon,
      color: 'blue',
      change: '+2 this month'
    },
    {
      title: 'Quizzes Completed',
      value: stats?.quizzesCompleted || 0,
      icon: DocumentTextIcon,
      color: 'green',
      change: `${stats?.averageScore || 0}% avg score`
    },
    {
      title: 'Study Hours',
      value: stats?.studyHours || 0,
      icon: ClockIcon,
      color: 'purple',
      change: '+5 this week'
    },
    {
      title: 'Achievement Points',
      value: stats?.achievementPoints || 0,
      icon: TrophyIcon,
      color: 'yellow',
      change: 'Top 10%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-blue-100">
          Ready to continue your learning journey? You have {upcomingEvents?.length || 0} upcoming events.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className={`text-xs text-${stat.color}-600 font-medium`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Courses */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-600" />
                My Courses
              </h2>
              <a href="/courses" className="text-blue-600 hover:text-blue-700 font-medium">
                View all
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses?.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </motion.div>

          {/* Recent Quizzes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2 text-green-600" />
                Recent Quizzes
              </h2>
              <a href="/quizzes" className="text-blue-600 hover:text-blue-700 font-medium">
                View all
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentQuizzes?.map((quiz) => (
                <QuizCard key={quiz._id} quiz={quiz} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-purple-600" />
                Upcoming Events
              </h3>
            </div>
            <div className="p-6">
              {upcomingEvents?.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-purple-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming events</p>
              )}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BellIcon className="h-5 w-5 mr-2 text-orange-600" />
                Notifications
              </h3>
            </div>
            <div className="p-6">
              {notifications?.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No new notifications</p>
              )}
            </div>
          </motion.div>

          {/* AI Assistant */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AIAssistant />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
