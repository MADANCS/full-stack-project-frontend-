import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCheck, Info, MessageSquare, ClipboardList, Folder, CheckCircle } from 'lucide-react';
import { api } from '../api/client';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      
      const badge = document.getElementById('notifBadge');
      if (badge) {
        badge.textContent = data.unreadCount;
        badge.style.display = data.unreadCount > 0 ? 'flex' : 'none';
      }
    } catch (err) {
      console.error('Load notifications error:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const user = api.getUser();
    const userId = user?.id || '1';
    let ws;

    try {
      ws = new WebSocket(`ws://localhost:3005?userId=${userId}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_notification') {
          loadNotifications();
        }
      };
      ws.onerror = () => console.log('WebSocket unavailable, using polling falls');
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }

    return () => ws?.close();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.request('/notifications/read-all', { method: 'PUT' });
      loadNotifications();
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned': return <ClipboardList size={16} />;
      case 'comment': return <MessageSquare size={16} />;
      case 'project_update': return <Folder size={16} />;
      case 'task_completed': return <CheckCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      <div 
        id="notificationOverlay" 
        className="notification-overlay" 
        onClick={() => {
          document.getElementById('notificationPanel').classList.remove('open');
          document.getElementById('notificationOverlay').classList.remove('open');
        }}
      />
      <div id="notificationPanel" className="notification-panel">
        <div className="notification-panel-header">
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>Notifications</h3>
          <div className="flex gap-sm">
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
              <CheckCheck size={16} />
              <span className="ml-xs">Mark all read</span>
            </button>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => {
                document.getElementById('notificationPanel').classList.remove('open');
                document.getElementById('notificationOverlay').classList.remove('open');
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="notification-panel-body" id="notifList">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Bell size={40} />
              </div>
              <div className="empty-state-title">All caught up!</div>
              <div className="empty-state-text">No notifications</div>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`notification-item ${n.read ? '' : 'unread'}`}>
                <div className="notification-item-icon">{getIcon(n.type)}</div>
                <div className="notification-item-content">
                  <div className="notification-item-title">{n.title}</div>
                  <div className="notification-item-message">{n.message}</div>
                  <div className="notification-item-time">{formatTime(n.createdAt)}</div>
                </div>
                {!n.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0 }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
