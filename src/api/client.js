// ═══════════════════════════════════════════════════════
// TaskFlow Pro — API Client
// ═══════════════════════════════════════════════════════

class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.token = localStorage.getItem('taskflow_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('taskflow_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  }

  getUser() {
    const data = localStorage.getItem('taskflow_user');
    return data ? JSON.parse(data) : null;
  }

  setUser(user) {
    localStorage.setItem('taskflow_user', JSON.stringify(user));
  }

  isAuthenticated() {
    return !!this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        this.clearToken();
        window.location.hash = '#/login';
        throw new Error('Session expired');
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (error) {
      if (error.message === 'Session expired') throw error;
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  get(endpoint) { return this.request(endpoint); }
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }

  // Auth
  login(email, password) { return this.post('/users/login', { email, password }); }
  register(name, email, password) { return this.post('/users/register', { name, email, password }); }

  // Users
  getUsers() { return this.get('/users'); }
  updateProfile(data) { return this.put('/users/me', data); }
  updateUser(id, data) { return this.put(`/users/${id}`, data); }

  // Projects
  getProjects(params) { return this.get(`/projects${params ? '?' + new URLSearchParams(params) : ''}`); }
  getProject(id) { return this.get(`/projects/${id}`); }
  createProject(data) { return this.post('/projects', data); }
  updateProject(id, data) { return this.put(`/projects/${id}`, data); }
  deleteProject(id) { return this.delete(`/projects/${id}`); }
  
  // Tasks
  getTasks(params) { return this.get(`/tasks${params ? '?' + new URLSearchParams(params) : ''}`); }
  getTask(id) { return this.get(`/tasks/${id}`); }
  createTask(data) { return this.post('/tasks', data); }
  updateTask(id, data) { return this.put(`/tasks/${id}`, data); }
  deleteTask(id) { return this.delete(`/tasks/${id}`); }
  getMagicSuggestion(title) { return this.post('/tasks/magic/suggest', { title }); }

  // Messages
  getRecentConversations() { return this.get('/messages/recent'); }
  getConversation(userId) { return this.get(`/messages/conversation/${userId}`); }
  sendMessage(receiverId, content) { return this.post('/messages', { receiverId, content }); }

  // Analytics
  getDashboard() { return this.get('/analytics/dashboard'); }
  getProjectAnalytics() { return this.get('/analytics/projects'); }
  getTeamAnalytics() { return this.get('/analytics/team'); }
  getPerformance() { return this.get('/analytics/performance'); }
  getFinancials() { return this.get('/analytics/financials'); }

  // Notifications
  getNotifications() { return this.get('/notifications'); }
  markNotificationRead(id) { return this.put(`/notifications/${id}/read`); }

  // Payments (Razorpay)
  getSubscriptionStatus(userId) { return this.get(`/payments/status/${userId}`); }
  createRazorpayOrder(userId, plan, amount) { return this.post('/payments/create-order', { userId, plan, amount }); }
  verifyRazorpayPayment(data) { return this.post('/payments/verify-payment', data); }
}

export const api = new ApiClient();
