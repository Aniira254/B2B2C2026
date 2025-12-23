import api from './api';

// Get sales rep profile
export const getProfile = async () => {
  const response = await api.get('/sales-reps/profile');
  return response;
};

// Leave Management
export const applyLeave = async (leaveData) => {
  const response = await api.post('/sales-reps/leave', leaveData);
  return response;
};

export const getLeaveRequests = async () => {
  const response = await api.get('/sales-reps/leave');
  return response;
};

export const cancelLeave = async (leaveId) => {
  const response = await api.patch(`/sales-reps/leave/${leaveId}/cancel`);
  return response;
};

// Announcements
export const getAnnouncements = async () => {
  const response = await api.get('/sales-reps/announcements');
  return response;
};

// Suggestions
export const submitSuggestion = async (suggestionData) => {
  const response = await api.post('/sales-reps/suggestions', suggestionData);
  return response;
};

export const getSuggestions = async () => {
  const response = await api.get('/sales-reps/suggestions');
  return response;
};

// Metrics
export const getMetrics = async () => {
  const response = await api.get('/sales-reps/metrics');
  return response;
};

// Reports
export const submitReport = async (reportData) => {
  const response = await api.post('/sales-reps/reports', reportData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const getReports = async () => {
  const response = await api.get('/sales-reps/reports');
  return response;
};

// Tasks
export const getTasks = async () => {
  const response = await api.get('/sales-reps/tasks');
  return response;
};

export const createTask = async (taskData) => {
  const response = await api.post('/sales-reps/tasks', taskData);
  return response;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.patch(`/sales-reps/tasks/${taskId}`, taskData);
  return response;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/sales-reps/tasks/${taskId}`);
  return response;
};

// Messaging
export const getConversations = async () => {
  const response = await api.get('/sales-reps/messages/conversations');
  return response;
};

export const getMessages = async (conversationId) => {
  const response = await api.get(`/sales-reps/messages/${conversationId}`);
  return response;
};

export const sendMessage = async (conversationId, messageData) => {
  const response = await api.post(`/sales-reps/messages/${conversationId}`, messageData);
  return response;
};
