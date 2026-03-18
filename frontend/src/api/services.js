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
  getUsers: () => api.get('/admin/users'),
  approveUser: (id) => api.put(`/admin/users/${id}/approve`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
};
