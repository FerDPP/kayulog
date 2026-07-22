const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

function getToken() {
  return localStorage.getItem('kayulog-token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error || 'Terjadi kesalahan';
    throw new Error(message);
  }

  return data;
}

// Auth
export const api = {
  login: (username, password) =>
    request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (name, username, password) =>
    request('/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, password }),
    }),

  getMe: () => request('/me'),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Expenses
  getExpenses: () => request('/expenses'),
  createExpense: (data) =>
    request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id) =>
    request(`/expenses/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data) =>
    request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  deleteCategory: (key) =>
    request(`/categories/${key}`, { method: 'DELETE' }),

  // Locations
  getLocations: () => request('/locations'),
  updateLocation: (data) =>
    request('/locations', { method: 'POST', body: JSON.stringify(data) }),

  // Capital
  getCapital: () => request('/capital'),
  createCapital: (data) =>
    request('/capital', { method: 'POST', body: JSON.stringify(data) }),
  deleteCapital: (id) =>
    request(`/capital/${id}`, { method: 'DELETE' }),
  getCapitalSummary: () => request('/capital/summary'),

  // Sales
  getSales: () => request('/sales'),
  createSale: (data) =>
    request('/sales', { method: 'POST', body: JSON.stringify(data) }),
  deleteSale: (id) =>
    request(`/sales/${id}`, { method: 'DELETE' }),

  // Employees
  getEmployees: () => request('/employees'),
  deleteEmployee: (username) =>
    request(`/employees/${username}`, { method: 'DELETE' }),
};
