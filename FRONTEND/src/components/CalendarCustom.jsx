import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isBefore, startOfDay, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const CalendarCustom = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2016, 0, 1)); // January 2016
  const [selectedDate, setSelectedDate] = useState(new Date(2016, 0, 1));
  const [viewMode, setViewMode] = useState('month'); // month, week, day

  // Sample events matching the image design
  const events = [
    {
      id: 1,
      date: new Date(2016, 0, 4),
      title: "New Year's Day",
      color: '#4CAF50',
      type: 'holiday'
    },
    {
      id: 2,
      date: new Date(2016, 0, 7),
      title: 'Team Meeting',
      color: '#2196F3',
      type: 'meeting',
      time: '10:00 AM'
    },
    {
      id: 3,
      date: new Date(2016, 0, 12),
      title: 'Project Deadline',
      color: '#FF9800',
      type: 'deadline'
    },
    {
      id: 4,
      date: new Date(2016, 0, 15),
      title: 'Conference',
      color: '#9C27B0',
      type: 'conference',
      image: '🎤'
    },
    {
      id: 5,
      date: new Date(2016, 0, 20),
      title: 'Workshop',
      color: '#F44336',
      type: 'workshop'
    },
    {
      id: 6,
      date: new Date(2016, 0, 25),
      title: 'Client Presentation',
      color: '#00BCD4',
      type: 'presentation'
    }
  ];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigatePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = getDay(firstDay);
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => 
      isSameDay(event.date, date)
    );
  };

  const renderMonthView = () => {
    const days = getDaysInMonth();
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDate);
            const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={index}
                onClick={() => date && setSelectedDate(date)}
                className={`min-h-[100px] p-2 border-r border-b border-gray-200 last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-blue-100' : ''} ${
                  date ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      !isCurrentMonth ? 'text-gray-400' : isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded truncate"
                          style={{ backgroundColor: event.color + '20', color: event.color }}
                        >
                          {event.image && <span className="mr-1">{event.image}</span>}
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(startOfWeekDate, i));
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              Week of {format(startOfWeekDate, 'MMM d, yyyy')}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7">
          {weekDays.map(date => {
            const dayEvents = getEventsForDate(date);
            const isToday = isSameDay(date, new Date());
            
            return (
              <div key={date.toISOString()} className="border-r border-gray-200 last:border-r-0">
                <div className={`p-3 text-center border-b border-gray-200 ${
                  isToday ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <div className="text-sm font-medium text-gray-700">
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
                <div className="p-2 min-h-[400px]">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="mb-2 p-2 rounded text-sm"
                      style={{ backgroundColor: event.color + '20', color: event.color }}
                    >
                      {event.time && <div className="font-medium">{event.time}</div>}
                      <div>{event.image && <span className="mr-1">{event.image}</span>}{event.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isToday = isSameDay(currentDate, new Date());

    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        <div className="flex">
          <div className="flex-1">
            <div className="border-b border-gray-200">
              {hours.map(hour => (
                <div key={hour} className="flex border-b border-gray-100">
                  <div className="w-20 p-3 text-sm text-gray-500 text-right border-r border-gray-200">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                  <div className="flex-1 p-3 min-h-[60px] hover:bg-gray-50 cursor-pointer">
                    {dayEvents
                      .filter(event => {
                        if (!event.time) return false;
                        const eventHour = parseInt(event.time.split(':')[0]);
                        const eventPeriod = event.time.includes('AM') ? 'AM' : 'PM';
                        const hourIn24 = eventPeriod === 'AM' 
                          ? (eventHour === 12 ? 0 : eventHour)
                          : (eventHour === 12 ? 12 : eventHour + 12);
                        return hourIn24 === hour;
                      })
                      .map(event => (
                        <div
                          key={event.id}
                          className="mb-2 p-2 rounded text-sm"
                          style={{ backgroundColor: event.color + '20', color: event.color }}
                        >
                          {event.image && <span className="mr-1">{event.image}</span>}
                          {event.title}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
};

export default CalendarCustom;
