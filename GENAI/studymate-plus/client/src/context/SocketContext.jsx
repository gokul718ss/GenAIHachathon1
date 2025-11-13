import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth.js';
import toast from 'react-hot-toast';

// Create context
const SocketContext = createContext();

// Socket provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (isAuthenticated && user) {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
      // Create socket connection
      const socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        auth: {
          token: localStorage.getItem('token')
        }
      });

      // Connection event handlers
      socketInstance.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Join user's room
        socketInstance.emit('join', user._id);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Quiz approval events
      socketInstance.on('quiz-approved', (data) => {
        toast.success(`Quiz "${data.quizTitle}" has been approved and added to your library!`);
        addNotification({
          id: Date.now(),
          type: 'quiz-approved',
          title: 'Quiz Approved',
          message: `Quiz "${data.quizTitle}" has been approved`,
          data: data,
          createdAt: new Date().toISOString()
        });
      });

      // Schedule approval events
      socketInstance.on('schedule-approved', (data) => {
        toast.success(`Study schedule "${data.scheduleTitle}" has been approved and added to your calendar!`);
        addNotification({
          id: Date.now(),
          type: 'schedule-approved',
          title: 'Schedule Approved',
          message: `Schedule "${data.scheduleTitle}" has been approved`,
          data: data,
          createdAt: new Date().toISOString()
        });
      });

      // General notification events
      socketInstance.on('notification', (data) => {
        toast(data.message, {
          icon: data.type === 'success' ? '✅' : data.type === 'warning' ? '⚠️' : 'ℹ️'
        });
        addNotification({
          id: Date.now(),
          ...data,
          createdAt: new Date().toISOString()
        });
      });

      // Course update events
      socketInstance.on('course-updated', (data) => {
        toast.info(`Course "${data.courseTitle}" has been updated`);
        addNotification({
          id: Date.now(),
          type: 'course-updated',
          title: 'Course Updated',
          message: `Course "${data.courseTitle}" has been updated`,
          data: data,
          createdAt: new Date().toISOString()
        });
      });

      // Assignment/quiz due reminders
      socketInstance.on('reminder', (data) => {
        toast(data.message, {
          icon: '🔔',
          duration: 6000
        });
        addNotification({
          id: Date.now(),
          type: 'reminder',
          title: 'Reminder',
          message: data.message,
          data: data,
          createdAt: new Date().toISOString()
        });
      });

      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  // Function to add notification to the list
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep only latest 50
  };

  // Function to remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Function to clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Function to emit events
  const emitEvent = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    }
  };

  // Function to send quiz approval
  const approveQuiz = (quizData) => {
    emitEvent('quiz-approved', {
      userId: user._id,
      quizId: quizData.id,
      quizTitle: quizData.title,
      approved: true,
      timestamp: new Date().toISOString()
    });
  };

  // Function to send schedule approval
  const approveSchedule = (scheduleData) => {
    emitEvent('schedule-approved', {
      userId: user._id,
      scheduleId: scheduleData.id,
      scheduleTitle: scheduleData.title,
      approved: true,
      timestamp: new Date().toISOString()
    });
  };

  // Function to join a room (for course-specific chats)
  const joinRoom = (roomId) => {
    emitEvent('join-room', { roomId, userId: user._id });
  };

  // Function to leave a room
  const leaveRoom = (roomId) => {
    emitEvent('leave-room', { roomId, userId: user._id });
  };

  const value = {
    socket,
    isConnected,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    emitEvent,
    approveQuiz,
    approveSchedule,
    joinRoom,
    leaveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};

export default SocketContext;