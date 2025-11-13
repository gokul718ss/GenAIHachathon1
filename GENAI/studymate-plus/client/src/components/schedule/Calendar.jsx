import React, { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Calendar = ({ events = [], onDateSelect, selectedDate = new Date() }) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Navigation functions
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a date has events
  const hasEvents = (day) => {
    if (!day) return false;
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return events.some(event => 
      event.startTime && event.startTime.startsWith(dateStr)
    );
  };

  // Check if date is today
  const isToday = (day) => {
    if (!day) return false;
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  // Check if date is selected
  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    return day === selectedDate.getDate() && 
           month === selectedDate.getMonth() && 
           year === selectedDate.getFullYear();
  };

  // Handle date click
  const handleDateClick = (day) => {
    if (!day) return;
    const newDate = new Date(year, month, day);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          {monthNames[month]} {year}
        </h3>
        <div className="flex items-center space-x-1">
          <button 
            onClick={goToPrevMonth}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={goToToday}
            className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
          >
            Today
          </button>
          <button 
            onClick={goToNextMonth}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                relative h-10 flex items-center justify-center text-sm cursor-pointer rounded
                ${!day ? 'invisible' : ''}
                ${isToday(day) ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                ${isSelected(day) ? 'bg-blue-600 text-white' : ''}
                ${!isToday(day) && !isSelected(day) ? 'hover:bg-gray-100' : ''}
                ${hasEvents(day) ? 'font-medium' : ''}
              `}
              onClick={() => handleDateClick(day)}
            >
              {day}
              {hasEvents(day) && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Events for selected date */}
      {selectedDate && events.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Events for {selectedDate.toLocaleDateString()}
          </h4>
          <div className="space-y-2">
            {events
              .filter(event => {
                if (!event.startTime) return false;
                const eventDate = new Date(event.startTime);
                return eventDate.toDateString() === selectedDate.toDateString();
              })
              .map((event, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="flex-1">{event.title}</span>
                  <span className="text-gray-500">
                    {new Date(event.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              ))}
            {events.filter(event => {
              if (!event.startTime) return false;
              const eventDate = new Date(event.startTime);
              return eventDate.toDateString() === selectedDate.toDateString();
            }).length === 0 && (
              <p className="text-gray-500 text-sm">No events for this date</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;