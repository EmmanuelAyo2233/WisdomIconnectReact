import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (u) => {
    if (!u) return u;
    const normalized = { ...u };
    if (!normalized.role && normalized.userType) {
      normalized.role = normalized.userType;
    }
    return normalized;
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const activeToken = localStorage.getItem('activeToken');
      if (!activeToken) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Set the token for this request if axios interceptor isn't doing it
      api.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
      
      const response = await api.get('/user/me');
      setUser(normalizeUser(response.data.user || response.data.data || response.data));
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      localStorage.removeItem('activeToken');
      localStorage.removeItem('mentorToken');
      localStorage.removeItem('menteeToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user: userData, token, banner } = response.data;
      
      // Mimic the user's Javascript local storage strategy
      if (userData.userType === 'mentor') {
          localStorage.setItem('mentorToken', token);
      } else if (userData.userType === 'mentee') {
          localStorage.setItem('menteeToken', token);
      }
      localStorage.setItem('activeToken', token);
      if (banner) localStorage.setItem('banner', banner);

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch the FULL profile immediately so Mentee/Mentor pages have all details (experience, etc.)
      try {
         const meRes = await api.get('/user/me');
         setUser(normalizeUser(meRes.data.user || meRes.data.data || meRes.data || userData));
      } catch (e) {
         setUser(normalizeUser(userData)); // Fallback to basic details if /me fails
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  };

  const registerMentor = async (data) => {
    try {
      const payload = data instanceof FormData ? data : { ...data, userType: 'mentor' };
      if (data instanceof FormData && !data.has('userType')) payload.append('userType', 'mentor');
      
      const response = await api.post('/auth/register', payload, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      const userData = response.data?.data?.user || response.data?.user;
      if (userData) {
         setUser(normalizeUser(userData));
         localStorage.setItem('wisdom_user', JSON.stringify(userData));
      }
      return response.data;
    } catch (error) {
       throw error.response?.data || { message: 'Registration failed' };
    }
  };

  const registerMentee = async (data) => {
    try {
      const payload = data instanceof FormData ? data : { ...data, userType: 'mentee' };
      if (data instanceof FormData && !data.has('userType')) payload.append('userType', 'mentee');

      const response = await api.post('/auth/register', payload, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      const userData = response.data?.data?.user || response.data?.user;
      if (userData) {
         setUser(normalizeUser(userData));
         localStorage.setItem('wisdom_user', JSON.stringify(userData));
      }
      return response.data;
    } catch (error) {
       throw error.response?.data || { message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
       await api.post('/auth/logout');
    } catch (error) {
       console.error("Logout API failed", error);
    } finally {
       setUser(null);
       localStorage.removeItem('activeToken');
       localStorage.removeItem('mentorToken');
       localStorage.removeItem('menteeToken');
       localStorage.removeItem('banner');
       delete api.defaults.headers.common['Authorization'];
       window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerMentee, registerMentor, checkAuthStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
