import React, { useState } from 'react';
import { Search, Bell, HelpCircle, User, Sun, Moon } from 'lucide-react';
import { api } from '../api/client';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../context/ThemeContext';
import NotificationPanel from './NotificationPanel';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const user = api.getUser() || { name: 'User', avatar: 'U' };
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllRead 
  } = useNotifications();

  return (
    <div className="header sticky top-0 z-10">
      <div className="header-left">
        <h1 className="header-title">Dashboard</h1>
      </div>
      <div className="header-right">
        <div className="header-search">
          <span className="header-search-icon">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search anything..." 
            id="globalSearch" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <button 
            className="header-icon-btn" 
            title="Notifications"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-badge animate-pulse" id="notifBadge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          <NotificationPanel 
            isOpen={isNotifOpen}
            notifications={notifications}
            onClose={() => setIsNotifOpen(false)}
            markAsRead={markAsRead}
            markAllRead={markAllRead}
          />
        </div>

        <button 
          className="header-icon-btn" 
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="header-icon-btn" title="Help">
          <HelpCircle size={18} />
        </button>
        
        <div className="sidebar-avatar" style={{ width: '34px', height: '34px', fontSize: 'var(--font-xs)', cursor: 'pointer' }} id="headerAvatar">
          {user.avatar || <User size={14} />}
        </div>
      </div>
    </div>
  );
};

export default Header;
