import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, 
  Calendar, CheckCircle2, Clock, AlertCircle, X 
} from 'lucide-react';

const projectIcons = ['🚀', '📱', '📊', '📖', '🔒', '⚙️', '🎨', '💡'];
const memberAvatars = ['AM', 'SC', 'JW', 'ED', 'MK'];
const memberColors = ['#6C5CE7', '#00B894', '#E17055', '#0984E3', '#E84393'];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const { theme } = useTheme();
  const { showToast } = useToast();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    deadline: '',
    color: '#6C5CE7'
  });

  const loadProjects = useCallback(async (statusFilter) => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const data = await api.getProjects(params);
      setProjects(data);
    } catch (err) {
      console.error('Projects load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects(filter);
  }, [filter, loadProjects]);

  const handleOpenModal = (project = null) => {
    if (project) {
      setCurrentProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        priority: project.priority,
        deadline: project.deadline || '',
        color: project.color
      });
    } else {
      setCurrentProject(null);
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        deadline: '',
        color: '#6C5CE7'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentProject) {
        await api.updateProject(currentProject.id, formData);
      } else {
        await api.createProject(formData);
      }
      setIsModalOpen(false);
      loadProjects(filter);
      showToast(`Project "${formData.name}" ${currentProject ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      showToast('Error saving project: ' + err.message, 'error');
    }
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await api.deleteProject(projectToDelete.id);
      loadProjects(filter);
      showToast(`Project "${projectToDelete.name}" deleted successfully.`);
    } catch (err) {
      showToast('Error deleting project: ' + err.message, 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = { active: 'badge-success', completed: 'badge-info', planning: 'badge-warning', archived: 'badge-neutral' };
    return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
  };

  const getPriorityBadge = (priority) => {
    const map = { critical: 'badge-danger', high: 'badge-pink', medium: 'badge-warning', low: 'badge-neutral' };
    return <span className={`badge ${map[priority] || 'badge-neutral'}`}>{priority}</span>;
  };

  return (
    <div className="projects-container">
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <p className="page-header-subtitle">Manage and track all your projects</p>
        </div>
        <div className="flex gap-md">
          <div className="glass-tabs">
            {['all', 'active', 'planning', 'completed'].map((f) => (
              <button 
                key={f}
                className={`tab-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-xs" /> New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: '240px' }}></div>)}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <div className="empty-state-title">No projects found</div>
          <p>Create a new project to get started</p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {projects.map((p, i) => (
            <motion.div 
              key={p.id} 
              className="project-card"
              style={{ 
                backgroundColor: theme === 'light' ? `${p.color}15` : 'var(--bg-card)', 
                borderColor: theme === 'light' ? `${p.color}30` : 'var(--border-primary)' 
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="project-card-accent" style={{ background: p.color }}></div>
              <div className="project-card-header">
                <div className="flex items-center gap-sm">
                  <div className="project-card-icon" style={{ background: `${p.color}20`, color: p.color }}>
                    {projectIcons[i % projectIcons.length]}
                  </div>
                  <div className="flex gap-xs">
                    {getStatusBadge(p.status)}
                    {getPriorityBadge(p.priority)}
                  </div>
                </div>
                <div className="flex gap-xs">
                  <button className="btn-icon-sm" onClick={() => handleOpenModal(p)}>
                    <Edit2 size={12} />
                  </button>
                  <button className="btn-icon-sm hover-danger" onClick={() => handleDeleteClick(p)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <h3 className="project-card-name">{p.name}</h3>
              <p className="project-card-desc">{p.description}</p>
              
              <div className="project-card-members">
                {p.members.slice(0, 4).map((m, j) => (
                  <div 
                    key={j} 
                    className="project-card-member" 
                    style={{ background: memberColors[parseInt(m) - 1] || '#6C5CE7' }}
                    title={`Member ${m}`}
                  >
                    {memberAvatars[parseInt(m) - 1] || '?'}
                  </div>
                ))}
                {p.members.length > 4 && (
                  <div className="project-card-member surplus">+{p.members.length - 4}</div>
                )}
              </div>

              <div className="project-card-footer">
                <div className="flex-1 mr-lg">
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-bar-fill" 
                      style={{ background: p.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${p.progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                <span className="project-card-progress-text">{p.progress}%</span>
              </div>
              
              {p.tags && (
                <div className="project-tags">
                  {p.tags.map(t => <span key={t} className="kanban-card-tag">{t}</span>)}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay open" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              className="modal-content" 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3 className="modal-title">{currentProject ? 'Edit Project' : 'New Project'}</h3>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-md">
                  <label className="form-label">Name</label>
                  <input 
                    className="form-input" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group mb-md">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-md mb-md">
                  <div className="form-group flex-1">
                    <label className="form-label">Priority</label>
                    <select 
                      className="form-input"
                      value={formData.priority}
                      onChange={e => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Deadline</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={formData.deadline}
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group mb-xl">
                  <label className="form-label">Color Theme</label>
                  <div className="flex gap-sm">
                    <input 
                      type="color" 
                      className="form-input color-picker" 
                      value={formData.color}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                    />
                    <div className="flex-1 flex gap-xs items-center">
                      {['#6C5CE7', '#00B894', '#E17055', '#0984E3', '#E84393'].map(c => (
                        <div 
                          key={c}
                          className={`color-swatch ${formData.color === c ? 'active' : ''}`}
                          style={{ background: c }}
                          onClick={() => setFormData({...formData, color: c})}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  {currentProject ? 'Update Project' : 'Create Project'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone and will delete all associated tasks.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        type="danger"
      />
    </div>
  );
};

export default Projects;
