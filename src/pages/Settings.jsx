import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Bell, Lock, Globe, Save, Trash2, Camera, Sparkles } from 'lucide-react';

const Settings = () => {
  const [user, setUser] = useState(api.getUser());
  const [activeTab, setActiveTab] = useState('Profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Member',
    avatar: user?.avatar || '',
    bio: user?.bio || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [message, setMessage] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await api.updateUser(user.id, formData);
      api.setUser(updatedUser);
      setUser(updatedUser);
      
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast('Error updating profile: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-container max-w-4xl mx-auto">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="page-header-subtitle">Manage your profile and workspace preferences</p>
        </div>
      </div>

      <div className="flex gap-2xl">
        {/* Navigation */}
        <div className="w-64 flex flex-col gap-sm">
          {['Profile', 'Security', 'Notifications', 'Workspace', 'Appearance'].map(tab => (
            <button 
              key={tab} 
              className={`btn btn-block justify-start text-left ${tab === activeTab ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ textAlign: 'left', padding: 'var(--space-md) var(--space-lg)' }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Profile' && <User size={16} className="mr-md" />}
              {tab === 'Security' && <Lock size={16} className="mr-md" />}
              {tab === 'Notifications' && <Bell size={16} className="mr-md" />}
              {tab === 'Workspace' && <Globe size={16} className="mr-md" />}
              {tab === 'Appearance' && <Sparkles size={16} className="mr-md" />}
              {tab}
            </button>
          ))}
          <div className="mt-8xl pt-xl border-t border-primary">
            <button className="btn btn-danger btn-block justify-start text-left">
              <Trash2 size={16} className="mr-md" /> Delete Account
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'Profile' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="chart-card">
                <div className="chart-card-header mb-2xl">
                  <span className="chart-card-title">Profile Information</span>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="flex items-center gap-2xl mb-3xl p-xl bg-glass border border-primary rounded-lg">
                    <div className="relative">
                      <div className="team-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', background: 'var(--accent-gradient)' }}>
                        {formData.avatar || formData.name[0]}
                      </div>
                      <button type="button" className="btn-icon-sm absolute bottom-0 right-0" style={{ background: 'var(--bg-primary)' }}>
                        <Camera size={12} />
                      </button>
                    </div>
                    <div>
                      <h4 className="mb-xs">Profile Photo</h4>
                      <p className="text-xs text-secondary mb-md">JPG, GIF or PNG. Max size of 800kB.</p>
                      <div className="flex gap-md">
                        <button type="button" className="btn btn-secondary btn-xs">Change</button>
                        <button type="button" className="btn btn-ghost btn-xs text-danger">Remove</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid-cols-2 mb-lg">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        className="form-input" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input 
                        className="form-input" 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="grid-cols-2 mb-2xl">
                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <select 
                        className="form-input" 
                        value={formData.role} 
                        onChange={e => setFormData({...formData, role: e.target.value})}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Developer">Developer</option>
                        <option value="Designer">Designer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Workspace</label>
                      <input className="form-input" disabled value="TaskFlow Pro HQ" />
                    </div>
                  </div>
                  
                  <div className="form-group mb-2xl">
                    <label className="form-label">Professional Bio / Description</label>
                    <textarea 
                      className="form-input" 
                      rows="4" 
                      placeholder="Tell us about yourself..."
                      value={formData.bio} 
                      onChange={e => setFormData({...formData, bio: e.target.value})} 
                    />
                  </div>

                  <div className="flex justify-between items-center pt-xl border-t border-primary">
                    <div></div>
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                      {isSaving ? 'Saving...' : <><Save size={16} className="mr-xs" /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'Notifications' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="chart-card">
                <div className="chart-card-header mb-lg">
                  <span className="chart-card-title">Notifications Preferences</span>
                </div>
                <div className="flex flex-col gap-md">
                  {[
                    { label: 'New task assigned', desc: 'Get notified when a manager assigns you a new task', checked: true },
                    { label: 'System updates', desc: 'Stay informed about platform changes and new features', checked: true },
                    { label: 'Team mentions', desc: 'Notifications when colleagues mention you in comments', checked: false }
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-md bg-glass border border-primary rounded-md">
                      <div>
                        <div className="font-semibold text-sm">{pref.label}</div>
                        <div className="text-xs text-secondary">{pref.desc}</div>
                      </div>
                      <div className="toggle-switch">
                        <input type="checkbox" defaultChecked={pref.checked} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Appearance' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="chart-card">
                <div className="chart-card-header mb-lg">
                  <span className="chart-card-title">Appearance Settings</span>
                </div>
                <p className="text-sm text-secondary mb-xl">Customize how TaskFlow Pro looks on your device.</p>
                
                <div className="flex flex-col gap-lg">
                  <div className="p-xl bg-glass border border-primary rounded-lg">
                    <div className="font-bold mb-md">Color Theme</div>
                    <div className="grid-cols-2 gap-md">
                      <button 
                        className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'} justify-center`}
                        onClick={() => theme !== 'light' && toggleTheme()}
                      >
                        <Save size={16} className="mr-sm" /> Light Mode
                      </button>
                      <button 
                        className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'} justify-center`}
                        onClick={() => theme !== 'dark' && toggleTheme()}
                      >
                        <Lock size={16} className="mr-sm" /> Dark Mode
                      </button>
                    </div>
                  </div>

                  <div className="p-xl bg-glass border border-primary rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold mb-xs">Dynamic Glassmorphism</div>
                      <div className="text-xs text-secondary">Automatically adjust transparency based on your OS settings.</div>
                    </div>
                    <div className="toggle-switch">
                      <input type="checkbox" defaultChecked={true} />
                    </div>
                  </div>

                  <div className="p-xl bg-glass border border-primary rounded-lg">
                    <div className="font-bold mb-md">UI Intensity</div>
                    <div className="flex items-center gap-xl">
                      <input type="range" className="flex-1" min="0" max="100" defaultValue="75" />
                      <span className="text-xs font-bold">75%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {(activeTab === 'Security' || activeTab === 'Workspace') && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="chart-card p-4xl text-center">
                <Shield size={48} className="mx-auto mb-lg text-tertiary" />
                <h3 className="mb-sm">{activeTab} Setup</h3>
                <p className="text-secondary">This section is being prepared for your workspace.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
