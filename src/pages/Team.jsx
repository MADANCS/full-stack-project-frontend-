import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Shield, User, MessageCircle, MoreVertical, Edit2, X, Save, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useNotifications } from '../hooks/useNotifications';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onlineUsers } = useNotifications();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', role: '', avatar: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  
  const navigate = useNavigate();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      role: user.role || 'Member',
      avatar: user.avatar || user.name[0]
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateUser(selectedUser.id, editFormData);
      setIsEditModalOpen(false);
      loadUsers();
      showToast('Member profile updated successfully!');
    } catch (err) {
      showToast('Error updating user: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    const map = { Admin: 'badge-danger', Manager: 'badge-warning', Developer: 'badge-info', Designer: 'badge-pink' };
    return <span className={`badge ${map[role] || 'badge-neutral'}`}>{role}</span>;
  };

  const isOnline = (userId) => onlineUsers.includes(String(userId));

  if (loading) return <div className="grid-cols-3">{[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: '280px' }}></div>)}</div>;

  return (
    <div className="team-container p-2xl">
      <div className="page-header mb-2xl">
        <div>
          <h2>Team Members</h2>
          <p className="page-header-subtitle">Collaborate with your workspace colleagues</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-xl">
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            className="chart-card p-xl hover-scale"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex justify-between items-start mb-lg relative">
              <div
                className="team-avatar relative"
                style={{ width: '64px', height: '64px', fontSize: '1.5rem', background: `hsl(${i * 60 + 200}, 70%, 60%)` }}
              >
                {user.avatar || user.name[0]}
                {/* Presence Indicator */}
                {isOnline(user.id) && (
                   <span className="presence-dot-pulsing" title="Online now"></span>
                )}
              </div>
              <button className="btn-icon-sm" onClick={() => handleOpenEdit(user)}><Edit2 size={14} /></button>
            </div>

            <h3 className="mb-xs font-bold">{user.name}</h3>
            <div className="flex items-center gap-sm mb-md">
              {getRoleBadge(user.role || 'Member')}
            </div>

            <div className="flex flex-col gap-sm mb-xl">
              <div className="flex items-center gap-md text-secondary text-sm">
                <Mail size={14} /> {user.email}
              </div>
              <div className="flex items-center gap-md text-sm">
                <Circle 
                  size={10} 
                  fill={isOnline(user.id) ? 'var(--success)' : 'var(--text-tertiary)'} 
                  color={isOnline(user.id) ? 'var(--success)' : 'var(--text-tertiary)'} 
                /> 
                <span className={isOnline(user.id) ? 'text-success font-semibold' : 'text-secondary'}>
                  {isOnline(user.id) ? 'Online Now' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex gap-md pt-lg border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button
                className="btn btn-secondary btn-sm flex-1"
                onClick={() => navigate(`/messages?user=${user.id}`)}
              >
                <MessageCircle size={14} className="mr-xs" /> Message
              </button>
              <button className="btn-icon-sm" style={{ height: '36px', width: '36px' }}>
                <MoreVertical size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="modal-overlay open" onClick={() => setIsEditModalOpen(false)}>
            <motion.div
              className="modal-content"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3 className="modal-title">Edit Team Member</h3>
                <button className="modal-close" onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="form-group mb-md">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    value={editFormData.name}
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-md">
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={editFormData.role}
                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                  </select>
                </div>
                <div className="form-group mb-xl">
                  <label className="form-label">Avatar Initials</label>
                  <input
                    className="form-input"
                    value={editFormData.avatar}
                    onChange={e => setEditFormData({ ...editFormData, avatar: e.target.value })}
                    maxLength={2}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={isSaving}>
                  {isSaving ? 'Updating...' : <><Save size={16} className="mr-xs" /> Update Member</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Team;
