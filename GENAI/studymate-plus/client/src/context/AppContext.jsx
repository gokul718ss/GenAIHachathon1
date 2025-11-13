import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  theme: 'light',
  sidebarOpen: true,
  loading: false,
  currentCourse: null,
  notifications: [],
  settings: {
    language: 'en',
    timezone: 'UTC',
    emailNotifications: true,
    pushNotifications: true
  }
};

// Action types
const APP_ACTIONS = {
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_LOADING: 'SET_LOADING',
  SET_CURRENT_COURSE: 'SET_CURRENT_COURSE',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
    
    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
    
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case APP_ACTIONS.SET_CURRENT_COURSE:
      return {
        ...state,
        currentCourse: action.payload
      };
    
    case APP_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    
    case APP_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case APP_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({
          type: APP_ACTIONS.UPDATE_SETTINGS,
          payload: settings
        });
      } catch (error) {
        console.error('Error loading app settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when settings change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Actions
  const setTheme = (theme) => {
    dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  const toggleSidebar = () => {
    dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR });
  };

  const setLoading = (loading) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading });
  };

  const setCurrentCourse = (course) => {
    dispatch({ type: APP_ACTIONS.SET_CURRENT_COURSE, payload: course });
  };

  const addNotification = (notification) => {
    const notificationWithId = {
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    dispatch({ type: APP_ACTIONS.ADD_NOTIFICATION, payload: notificationWithId });

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(notificationWithId.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    dispatch({ type: APP_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  };

  const updateSettings = (newSettings) => {
    dispatch({ type: APP_ACTIONS.UPDATE_SETTINGS, payload: newSettings });
  };

  const value = {
    ...state,
    setTheme,
    toggleSidebar,
    setLoading,
    setCurrentCourse,
    addNotification,
    removeNotification,
    updateSettings
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};

export default AppContext;