import api from './axios';

export const mentorService = {
  getMentors: (params) => api.get('/mentors/explore', { params }),
  getMentorById: (id) => api.get(`/mentors/${id}`),
  updateMentorProfile: (id, data) => api.put(`/mentors/${id}`, data),
};

export const menteeService = {
  getMenteeById: (id) => api.get(`/user/mentee/${id}`),
};

export const bookingService = {
  createBooking: (mentorUserId, data) => api.post(`/appointments/book/${mentorUserId}`, data),
  getMenteeBookings: () => api.get('/appointments/mentee'),
  getMentorBookings: () => api.get('/appointments/mentor'),
  updateBookingStatus: (id, action) => api.put(`/appointments/${id}/${action}`), // 'accept' or 'reject'
  cancelBooking: (id) => api.put(`/appointments/${id}/cancel`),
  getAvailability: (mentorUserId) => api.get(`/availability/${mentorUserId}`),
  getOwnAvailability: () => api.get('/availability'),
  createAvailability: (data) => api.post('/availability', data),
  updateAvailability: (id, data) => api.put(`/availability/${id}`, data),
  deleteAvailability: (id) => api.delete(`/availability/${id}`),
  completeSession: (id) => api.post(`/sessions/${id}/complete`),
  submitReview: (id, data) => api.post(`/sessions/${id}/review`, data),
  submitCommendation: (id, data) => api.post(`/sessions/${id}/commendation`, data),
};

export const chatService = {
  getMessages: (connectionId) => api.get(`/chat/${connectionId}/messages`),
  sendMessage: (connectionId, data) => api.post(`/chat/${connectionId}/messages`, data),
  uploadFile: (connectionId, formData) => api.post(`/chat/${connectionId}/upload`, formData),
  clearConversation: (connectionId) => api.delete(`/chat/${connectionId}/clear`),
};

export const playbookService = {
  getPlaybooks: () => api.get('/playbooks'),
  getMentorPlaybooks: () => api.get('/playbooks/mine'),
  getPlaybookDetails: (id) => api.get(`/playbooks/${id}`),
  createPlaybook: (data) => api.post('/playbooks/create', data),
  updatePlaybook: (id, data) => api.put(`/playbooks/${id}`, data),
  deletePlaybook: (id) => api.delete(`/playbooks/${id}`),
  likePlaybook: (id) => api.post(`/playbooks/${id}/like`),
  savePlaybook: (id) => api.post(`/playbooks/${id}/save`),
  getSavedPlaybooks: () => api.get('/playbooks/user/saved'),
  getPlaybookComments: (id) => api.get(`/playbooks/${id}/comments`),
  getPlaybookReplies: (id, commentId, page = 1) => api.get(`/playbooks/${id}/comments/${commentId}/replies?page=${page}&limit=5`),
  addPlaybookComment: (id, data) => api.post(`/playbooks/${id}/comments`, data),
  updatePlaybookComment: (id, commentId, data) => api.put(`/playbooks/${id}/comments/${commentId}`, data),
  deletePlaybookComment: (id, commentId) => api.delete(`/playbooks/${id}/comments/${commentId}`),
};

export const messageRequestService = {
  sendMessageRequest: (data) => api.post('/message-requests/send', data),
  getMentorMessageRequests: () => api.get('/message-requests/mentor'),
  respondToMessageRequest: (requestId, status) => api.put(`/message-requests/${requestId}/respond`, { status }),
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

export const paymentService = {
  getWallet: () => api.get('/payments/wallet'),
  getAdminWallet: () => api.get('/payments/wallet/admin'),
  withdrawFunds: (amount) => api.post('/payments/wallet/withdraw', { amount }),
  getTransactions: () => api.get('/payments/transactions'),
};
