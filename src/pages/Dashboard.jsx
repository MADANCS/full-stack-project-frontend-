import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { 
  RefreshCw, TrendingUp, TrendingDown, Users, CheckSquare, 
  FolderKanban, Activity, BarChart3 
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardData, projectData] = await Promise.all([
        api.getDashboard(),
        api.getProjects()
      ]);
      setData(dashboardData);
      setProjects(projectData.slice(0, 5));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !data) {
    return (
      <div className="grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton skeleton-card" style={{ height: '120px' }}></div>
        ))}
      </div>
    );
  }

  const statCards = [
    { icon: <FolderKanban size={20} />, label: 'Total Projects', value: data?.totalProjects || 0, change: '+2', positive: true, color: '#6C5CE7', bg: 'rgba(108,92,231,0.1)' },
    { icon: <CheckSquare size={20} />, label: 'Completed Tasks', value: data?.completedTasks || 0, change: '+5', positive: true, color: '#00B894', bg: 'rgba(0,184,148,0.1)' },
    { icon: <Users size={20} />, label: 'Team Members', value: data?.teamMembers || 0, change: '+1', positive: true, color: '#0984E3', bg: 'rgba(9,132,227,0.1)' },
    { icon: <BarChart3 size={20} />, label: 'Completion Rate', value: (data?.avgCompletionRate || 0) + '%', change: '+3%', positive: true, color: '#E84393', bg: 'rgba(232,67,147,0.1)' },
  ];

  const pieData = [
    { name: 'To Do', value: data?.tasksByStatus?.todo || 0, color: '#E17055' },
    { name: 'In Progress', value: data?.tasksByStatus?.inProgress || 0, color: '#FDCB6E' },
    { name: 'Review', value: data?.tasksByStatus?.review || 0, color: '#0984E3' },
    { name: 'Done', value: data?.tasksByStatus?.done || 0, color: '#00B894' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="page-header-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-md">
          <button 
            className={`btn btn-secondary btn-sm ${loading ? 'opacity-50' : ''}`} 
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="ml-xs">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div 
            key={card.label} 
            className="stat-card" 
            style={{ 
              '--stat-color': card.color,
              backgroundColor: theme === 'light' ? `${card.color}15` : 'var(--bg-card)',
              borderColor: theme === 'light' ? `${card.color}30` : 'var(--border-primary)'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-card-value">{card.value}</div>
            <div className="stat-card-label">{card.label}</div>
            <div className={`stat-card-change ${card.positive ? 'positive' : 'negative'}`}>
              {card.positive ? <TrendingUp size={12} className="inline mr-xs" /> : <TrendingDown size={12} className="inline mr-xs" />}
              {card.change} this week
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-2xl)' }}>
        <div className="grid-cols-2" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Weekly Progress</span>
              <span className="badge badge-success">Live</span>
            </div>
            <div style={{ height: '300px', width: '100%', marginTop: 'var(--space-lg)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.weeklyProgress || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="completed" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="created" fill="#E84393" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Tasks by Status</span>
            </div>
            <div style={{ height: '300px', width: '100%', marginTop: 'var(--space-lg)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid-cols-2">
          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Project Overview</span>
            </div>
            <div style={{ marginTop: 'var(--space-md)' }}>
              {projects.map(p => (
                <div key={p.id} className="flex items-center gap-lg" style={{ padding: 'var(--space-md) 0', borderBottom: '1px solid var(--border-primary)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color, flexShrink: 0 }}></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{p.members?.length || 0} members</div>
                  </div>
                  <div style={{ width: '100px' }}>
                    <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${p.progress}%` }}></div></div>
                  </div>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', width: '35px', textAlign: 'right' }}>{p.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <span className="chart-card-title">Recent Activity</span>
              <span className="text-sm text-secondary">Today</span>
            </div>
            <div className="activity-feed" style={{ marginTop: 'var(--space-md)' }}>
              {data?.recentActivity?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-tertiary)' }}>
                  <Activity size={32} style={{ marginBottom: 'var(--space-sm)', opacity: 0.5 }} />
                  <p>No recent activity found</p>
                </div>
              ) : (
                data?.recentActivity?.map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-item-icon">{a.icon}</div>
                    <div className="activity-item-content">
                      <div className="activity-item-text">
                        <strong>{a.user}</strong> <span>{a.action}</span> <em>{a.target}</em>
                      </div>
                      <div className="activity-item-time">{a.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
