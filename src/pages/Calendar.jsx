import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await api.getTasks();
        setTasks(data);
      } catch (err) {
        console.error('Error loading tasks for calendar:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateFullCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    const days = [];
    
    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ 
        day: daysInPrevMonth - i, 
        month: prevMonth, 
        year: prevMonthYear, 
        isCurrentMonth: false 
      });
    }
    
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        month, 
        year, 
        isCurrentMonth: true 
      });
    }
    
    // Next month padding to fill 42 cells (7x6)
    const remainingCells = 42 - days.length;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ 
        day: i, 
        month: nextMonth, 
        year: nextMonthYear, 
        isCurrentMonth: false 
      });
    }
    
    return days;
  };

  const calendarDays = generateFullCalendarDays();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getTasksForDay = (d) => {
    const dateStr = `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));
  };

  const getPriorityColor = (priority) => {
    const map = { critical: '#E17055', high: '#E84393', medium: '#FDCB6E', low: '#00B894' };
    return map[priority] || 'var(--accent-primary)';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  return (
    <div className="calendar-container">
      <div className="page-header">
        <div>
          <h2>Task Calendar</h2>
          <p className="page-header-subtitle">
            {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-md items-center">
          <div className="glass flex items-center p-xs px-md" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
            <button className="btn-icon-sm" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <div className="mx-md font-semibold" style={{ minWidth: '160px', textAlign: 'center' }}>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button className="btn-icon-sm" onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>
            Today
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-header-row">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="calendar-header-cell">{d}</div>)}
        </div>
        <div className="calendar-body">
          {calendarDays.map((d, i) => {
            const dayTasks = getTasksForDay(d);
            const isToday = d.day === new Date().getDate() && 
                            d.month === new Date().getMonth() && 
                            d.year === new Date().getFullYear();
            
            const isSelected = d.day === selectedDate.getDate() &&
                               d.month === selectedDate.getMonth() &&
                               d.year === selectedDate.getFullYear();

            return (
              <div 
                key={i} 
                className={`calendar-cell ${d.isCurrentMonth ? '' : 'inactive'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(new Date(d.year, d.month, d.day))}
              >
                <div className="calendar-cell-number">{d.day}</div>
                <div className="calendar-task-list">
                  {dayTasks.map(t => (
                    <div 
                      key={t.id} 
                      className="calendar-task-item"
                      style={{ borderLeft: `3px solid ${getPriorityColor(t.priority)}` }}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2xl flex gap-lg">
        <div className="chart-card flex-1">
          <div className="chart-card-header mb-md">
            <span className="chart-card-title">Upcoming This Week</span>
          </div>
          {tasks.filter(t => t.status !== 'done').slice(0, 3).map(t => (
            <div key={t.id} className="flex items-center gap-md p-md bg-glass border border-primary rounded-md mb-sm">
              <div className="stat-card-icon" style={{ background: 'var(--bg-glass-strong)', fontSize: '1.25rem' }}>🗓️</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{t.title}</div>
                <div className="text-xs text-secondary">{formatDate(t.dueDate)}</div>
              </div>
              <span className={`badge ${t.priority === 'critical' ? 'badge-danger' : 'badge-neutral'}`}>{t.priority}</span>
            </div>
          ))}
        </div>
        <div className="chart-card flex-1">
          <div className="chart-card-header mb-md">
            <span className="chart-card-title">Calendar Legend</span>
          </div>
          <div className="flex flex-col gap-sm">
            {['critical', 'high', 'medium', 'low'].map(p => (
              <div key={p} className="flex items-center gap-md">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getPriorityColor(p) }}></div>
                <span className="text-sm capitalize text-secondary">{p} Priority</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
