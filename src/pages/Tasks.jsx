import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, MessageSquare, Edit2, X, AlertCircle, 
  CheckCircle2, Clock, Search, Filter, MoreHorizontal, User, Trash2, Sparkles, Loader2 
} from 'lucide-react';

const avatarMap = { '1': 'AM', '2': 'SC', '3': 'JW', '4': 'ED', '5': 'MK' };
const colorMap = { '1': '#6C5CE7', '2': '#00B894', '3': '#E17055', '4': '#0984E3', '5': '#E84393' };

const columns = [
  { key: 'todo', title: 'To Do', icon: '📋', color: '#E17055' },
  { key: 'in-progress', title: 'In Progress', icon: '⚡', color: '#FDCB6E' },
  { key: 'review', title: 'In Review', icon: '🔍', color: '#0984E3' },
  { key: 'done', title: 'Done', icon: '✅', color: '#00B894' },
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const { theme } = useTheme();
  const { showToast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '1',
    dueDate: '',
    projectId: '1'
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Tasks load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleOpenModal = (task = null) => {
    if (task) {
      setCurrentTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate || '',
        projectId: task.projectId || '1'
      });
    } else {
      setCurrentTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: '1',
        dueDate: '',
        projectId: '1'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentTask) {
        await api.updateTask(currentTask.id, formData);
      } else {
        await api.createTask(formData);
      }
      setIsModalOpen(false);
      loadTasks();
      showToast(`Task "${formData.title}" ${currentTask ? 'updated' : 'saved'} successfully!`);
    } catch (err) {
      showToast('Error saving task: ' + err.message, 'error');
    }
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.deleteTask(taskToDelete.id);
      loadTasks();
      showToast(`Task "${taskToDelete.title}" deleted.`);
    } catch (err) {
      showToast('Error deleting task: ' + err.message, 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleMagicSuggest = async () => {
    if (!formData.title) {
      showToast('Please enter a task title first!', 'info');
      return;
    }

    setIsMagicLoading(true);
    try {
      // Check subscription status first
      const sub = await api.getSubscriptionStatus(api.getUser()?.id);
      if (sub.plan === 'Free') {
        showToast('Sparkles AI is a Pro feature! Visit the Billing page to upgrade.', 'info');
        setIsMagicLoading(false);
        return;
      }

      const suggestion = await api.getMagicSuggestion(formData.title);
      setFormData({
        ...formData,
        description: suggestion.description,
        priority: suggestion.priority,
        tags: suggestion.tags
      });
      showToast('AI suggestion applied! ✨', 'success');
    } catch (err) {
      console.error('Magic suggest error:', err);
      showToast('AI service currently busy. Try again later.', 'warning');
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    try {
      await api.updateTask(taskId, { status });
      loadTasks();
    } catch (err) {
      console.error('Update task status error:', err);
    }
    setDraggedTaskId(null);
  };

  const getPriorityBadge = (priority) => {
    const map = { critical: 'badge-danger', high: 'badge-pink', medium: 'badge-warning', low: 'badge-neutral' };
    return <span className={`badge ${map[priority] || 'badge-neutral'}`}>{priority}</span>;
  };

  return (
    <div className="tasks-container">
      <div className="page-header">
        <div>
          <h2>Task Board</h2>
          <p className="page-header-subtitle">Drag tasks between columns to update status</p>
        </div>
        <div className="flex gap-md">
          <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-xs" /> New Task
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {columns.map(col => (
          <div 
            key={col.key} 
            className="kanban-column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span style={{ color: col.color, marginRight: 'var(--space-sm)' }}>{col.icon}</span> 
                {col.title}
                <span className="kanban-column-count">
                  {tasks.filter(t => t.status === col.key).length}
                </span>
              </div>
            </div>
            <div className="kanban-column-body">
              {loading ? (
                [1, 2].map(i => <div key={i} className="skeleton skeleton-card mb-md" style={{ height: '140px' }}></div>)
              ) : (
                tasks.filter(t => t.status === col.key).map((t, i) => (
                  <motion.div 
                    key={t.id} 
                    className={`kanban-card ${draggedTaskId === t.id ? 'dragging' : ''}`}
                    style={{ 
                      backgroundColor: theme === 'light' ? 
                        (t.priority === 'critical' ? 'rgba(225, 112, 85, 0.08)' : 
                         t.priority === 'high' ? 'rgba(232, 67, 147, 0.08)' : 
                         t.priority === 'medium' ? 'rgba(253, 203, 110, 0.08)' : 
                         'rgba(99, 110, 114, 0.08)') : 'var(--bg-secondary)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'var(--border-primary)'
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex justify-between items-start mb-sm">
                      <div className="flex gap-sm items-center">
                        {getPriorityBadge(t.priority)}
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>#{t.id.slice(-4)}</span>
                      </div>
                      <div className="flex gap-xs">
                        <button className="btn-icon-sm" onClick={() => handleOpenModal(t)}>
                          <Edit2 size={12} />
                        </button>
                        <button className="btn-icon-sm hover-danger" onClick={() => handleDeleteClick(t)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="kanban-card-title">{t.title}</div>
                    <div className="kanban-card-desc">{t.description}</div>
                    <div className="kanban-card-footer">
                      <div className="kanban-card-tags">
                        {t.tags?.map(tag => <span key={tag} className="kanban-card-tag">{tag}</span>)}
                      </div>
                      <div 
                        className="kanban-card-avatar" 
                        style={{ background: colorMap[t.assignee] || '#6C5CE7' }}
                        title={avatarMap[t.assignee] || 'Unknown'}
                      >
                        {avatarMap[t.assignee] || '?'}
                      </div>
                    </div>
                    {t.dueDate && (
                      <div className="mt-sm text-xs text-secondary flex items-center gap-xs">
                        <Calendar size={12} /> {new Date(t.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {t.comments?.length > 0 && (
                      <div className="mt-xs text-xs text-secondary flex items-center gap-xs">
                        <MessageSquare size={12} /> {t.comments.length}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

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
                <h3 className="modal-title">{currentTask ? 'Edit Task' : 'New Task'}</h3>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-md">
                  <div className="flex justify-between items-center mb-xs">
                    <label className="form-label mb-0">Task Title</label>
                    <button 
                      type="button" 
                      className={`btn-magic-sm ${isMagicLoading ? 'loading' : ''}`}
                      onClick={handleMagicSuggest}
                      disabled={isMagicLoading || !formData.title}
                    >
                      {isMagicLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      <span>Magic Suggest</span>
                    </button>
                  </div>
                  <input 
                    className="form-input" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Design Landing Page"
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
                    <label className="form-label">Status</label>
                    <select 
                      className="form-input"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
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
                </div>
                <div className="flex gap-md mb-xl">
                  <div className="form-group flex-1">
                    <label className="form-label">Assignee</label>
                    <select 
                      className="form-input"
                      value={formData.assignee}
                      onChange={e => setFormData({...formData, assignee: e.target.value})}
                    >
                      <option value="1">Alex Morgan</option>
                      <option value="2">Sarah Chen</option>
                      <option value="3">James Wilson</option>
                      <option value="4">Emily Davis</option>
                      <option value="5">Michael Kim</option>
                    </select>
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Due Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={formData.dueDate}
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  {currentTask ? 'Update Task' : 'Save Task'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete the task "${taskToDelete?.title}"? this action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        type="danger"
      />
    </div>
  );
};

export default Tasks;
