import React from 'react';
import { Mail, CheckCircle, Info, Star, Trash2 } from 'lucide-react';

const NotificationPanel = ({ isOpen, notifications, onClose, markAsRead, markAllRead }) => {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'new_message': return <Mail size={16} className="text-primary" />;
      case 'task_completed': return <CheckCircle size={16} className="text-success" />;
      case 'project_created': return <Star size={16} className="text-warning" />;
      default: return <Info size={16} className="text-secondary" />;
    }
  };

  return (
    <>
      <div className="notification-overlay open" onClick={onClose}></div>
      <div className="notification-panel open">
        <div className="p-xl border-b flex justify-between items-center" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="font-semibold">Notifications</h3>
          <button className="text-xs text-primary hover-underline" onClick={markAllRead}>Mark all as read</button>
        </div>
        <div className="notifications-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div className="p-2xl text-center text-secondary text-sm">
              <Info size={32} className="mx-auto mb-md opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <div className="notif-icon">
                  {getIcon(notif.type)}
                </div>
                <div className="notif-content">
                  <div className="notif-title">{notif.title}</div>
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
                {!notif.read && <div className="unread-dot"></div>}
              </div>
            ))
          )}
        </div>
        <div className="p-lg text-center border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <button className="text-xs text-secondary hover-text-primary">View all notifications</button>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
