import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { LayoutDashboard, FolderKanban, CheckSquare, BarChart3, Users, MessageSquare, Calendar, Settings, LogOut, CreditCard } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = api.getUser() || { name: 'User', role: 'Developer', avatar: 'U' };

  const handleLogout = () => {
    if (window.confirm('Sign out?')) {
      api.clearToken();
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Projects', icon: <FolderKanban size={20} />, path: '/projects', badge: 6 },
    { name: 'Task Board', icon: <CheckSquare size={20} />, path: '/tasks', badge: 12 },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
  ];

  const workspaceItems = [
    { name: 'Team', icon: <Users size={20} />, path: '/team' },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/messages' },
    { name: 'Calendar', icon: <Calendar size={20} />, path: '/calendar' },
    { name: 'Billing', icon: <CreditCard size={20} />, path: '/billing' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">⚡</div>
        <span className="sidebar-brand">TaskFlow Pro</span>
      </div>
      
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Main</div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span>{item.name}</span>
              {item.badge && <span className="sidebar-item-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Workspace</div>
          {workspaceItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <div className="sidebar-avatar">{user.avatar || user.name.charAt(0)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
          <LogOut size={16} style={{ color: 'var(--text-tertiary)' }} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
