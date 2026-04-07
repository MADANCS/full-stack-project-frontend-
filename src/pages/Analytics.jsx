import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, AreaChart, Area
} from 'recharts';
import { 
  Activity, Zap, Globe, Shield, TrendingUp, BarChart3, 
  Users, CheckCircle2, AlertCircle, Heart, DollarSign, PieChart as PieIcon, TrendingDown
} from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboard, projectData, teamData, perfData, financials] = await Promise.all([
        api.getDashboard(),
        api.getProjectAnalytics(),
        api.getTeamAnalytics(),
        api.getPerformance(),
        api.getFinancials(),
      ]);
      setData({ dashboard, projectData, teamData, perfData, financials });
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !data) {
    return (
      <div className="grid grid-cols-4 gap-md p-2xl">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: '120px' }}></div>)}
      </div>
    );
  }

  const { dashboard, projectData, teamData, perfData, financials } = data;

  const topStats = [
    { icon: <DollarSign size={20} />, label: 'Monthly Revenue (MRR)', value: `₹${financials.mrr.toLocaleString()}`, color: '#00B894', bg: 'rgba(0,184,148,0.1)' },
    { icon: <Users size={20} />, label: 'Pro Subscriptions', value: financials.activePro, color: '#6C5CE7', bg: 'rgba(108,92,231,0.1)' },
    { icon: <Activity size={20} />, label: 'Avg Resp Time', value: perfData.avgResponseTime, color: '#0984E3', bg: 'rgba(9,132,227,0.1)' },
    { icon: <TrendingUp size={20} />, label: 'Conversion Rate', value: '12.4%', color: '#E84393', bg: 'rgba(232,67,147,0.1)' },
  ];

  const priorityPieData = [
    { name: 'Critical', value: dashboard.tasksByPriority.critical, color: '#E17055' },
    { name: 'High', value: dashboard.tasksByPriority.high, color: '#E84393' },
    { name: 'Medium', value: dashboard.tasksByPriority.medium, color: '#FDCB6E' },
    { name: 'Low', value: dashboard.tasksByPriority.low, color: '#636e72' },
  ];

  const teamColors = ['#6C5CE7', '#00B894', '#E17055', '#0984E3', '#E84393'];

  return (
    <div className="analytics-container p-2xl">
      <div className="page-header mb-2xl">
        <div>
          <h2>Business Intelligence</h2>
          <p className="page-header-subtitle">Real-time insights across microservices and financial performance</p>
        </div>
        <div className="flex gap-sm">
          <div className="badge badge-success flex items-center gap-xs">
            <Shield size={12} /> Enterprise Plan Active
          </div>
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-4 gap-xl mb-3xl">
        {topStats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="chart-card flex flex-col items-center justify-center p-xl text-center"
          >
            <div className="stat-card-icon mb-md" style={{ background: stat.bg, color: stat.color, width: '48px', height: '48px' }}>
              {stat.icon}
            </div>
            <div className="text-secondary text-xs uppercase tracking-widest font-bold mb-xs">{stat.label}</div>
            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Combined Financials & Trends */}
      <div className="grid grid-cols-3 gap-xl mb-3xl">
        <div className="col-span-2 chart-card">
          <div className="chart-card-header justify-between">
            <div className="flex items-center gap-sm">
              <TrendingUp size={18} className="text-success" />
              <span className="chart-card-title">Revenue Growth Trend</span>
            </div>
            <span className="text-xs text-secondary">Last 4 Months</span>
          </div>
          <div style={{ height: '320px', width: '100%', marginTop: 'var(--space-xl)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financials.revenueGrowth}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B894" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00B894" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                   contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00B894" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="flex items-center gap-sm">
              <PieIcon size={18} className="text-accent" />
              <span className="chart-card-title">Subscription Mix</span>
            </div>
          </div>
          <div style={{ height: '280px', width: '100%', marginTop: 'var(--space-lg)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financials.subscriptionMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {financials.subscriptionMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-sm mt-md px-md">
            {financials.subscriptionMix.map(item => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-xs">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                  <span className="text-secondary">{item.name}</span>
                </div>
                <span className="font-bold">{item.value} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Existing Operational Metrics */}
      <div className="grid grid-cols-2 gap-xl mb-3xl">
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">System Performance History</span>
          </div>
          <div style={{ height: '300px', width: '100%', marginTop: 'var(--space-xl)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                />
                <Line type="monotone" dataKey="tasks" stroke="#6C5CE7" strokeWidth={3} dot={{ fill: '#6C5CE7' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="completed" stroke="#00B894" strokeWidth={3} dot={{ r: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Service Health Monitor</span>
          </div>
          <div className="flex flex-col gap-md mt-xl">
             {perfData.serviceHealth.map((s, i) => (
                <div key={s.name} className="flex items-center gap-md p-md glass" style={{ borderRadius: 'var(--radius-md)' }}>
                   <div className={`status-dot ${s.status === 'healthy' ? 'online' : 'offline'}`} style={{ width: '8px', height: '8px' }}></div>
                   <div className="flex-1">
                      <div className="font-bold text-sm">{s.name}</div>
                      <div className="text-secondary text-xs">{s.latency} latency · {s.uptime}% uptime</div>
                   </div>
                   <div className={`badge ${s.status === 'healthy' ? 'badge-success' : 'badge-danger'}`}>{s.status}</div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
