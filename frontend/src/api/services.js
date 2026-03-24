import api from './axios';

export const mentorService = {
  getMentors: (params) => api.get('/mentors/explore', { params }),
  getMentorById: (id) => api.get(`/mentors/${id}`),
  updateMentorProfile: (id, data) => api.put(`/mentors/${id}`, data),
};

export const bookingService = {
  createBooking: (mentorUserId, data) => api.post(`/appointments/book/${mentorUserId}`, data),
  getMenteeBookings: () => api.get('/appointments/mentee'),
  getMentorBookings: () => api.get('/appointments/mentor'),
  updateBookingStatus: (id, action) => api.put(`/appointments/${id}/${action}`), // 'accept' or 'reject'
  cancelBooking: (id) => api.put(`/appointments/${id}/cancel`),
  deleteBooking: (id) => api.delete(`/appointments/${id}`),
  getAvailability: (mentorUserId) => api.get(`/availability/${mentorUserId}`),
  createAvailability: (data) => api.post('/availability', data),
  updateAvailability: (id, data) => api.put(`/availability/${id}`, data),
  deleteAvailability: (id) => api.delete(`/availability/${id}`),
};

export const chatService = {
  getMessages: (userId) => api.get(`/chat/messages/${userId}`),
  sendMessage: (data) => api.post('/chat/messages', data),
};

export const postService = {
  getPosts: () => api.get('/post'),
  getPostById: (id) => api.get(`/post/${id}`),
  createPost: (data) => api.post('/post', data),
  updatePost: (id, data) => api.put(`/post/${id}`, data),
  deletePost: (id) => api.delete(`/post/${id}`),
};

export const adminService = {
  getUsers: () => api.get('/admin/users'), // for all users page
  getStats: () => api.get('/admin/stats'), // for admin home
  getPendingMentors: () => api.get('/admin/pending-mentors'), // for admin approvals
  getApprovedMentors: () => api.get('/admin/approved-mentors'), // for approved mentors page
  getRejectedMentors: () => api.get('/admin/rejected-mentors'), // for rejected mentors page
  getMentees: () => api.get('/admin/mentees'), // for mentees page
  approveUser: (id) => api.put(`/admin/approve-mentor/${id}`),
  rejectUser: (id) => api.put(`/admin/reject-mentor/${id}`),
  reconsiderMentor: (id) => api.put(`/admin/reconsider-mentor/${id}`),
  deleteUser: (id) => api.delete(`/admin/delete-mentor/${id}`),
  deleteMentee: (id) => api.delete(`/admin/mentee/${id}`)
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

export const connectionService = {
  requestConnection: (mentorUserId, data) => api.post(`/connections/request/${mentorUserId}`, data),
  respondConnection: (connectionId, status) => api.put(`/connections/respond/${connectionId}`, { status }),
  getConnections: () => api.get('/connections'),
};
