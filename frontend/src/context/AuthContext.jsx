import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.data);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.data.token);
    setUser(res.data.data);
    return res.data;
  };

  const adminLogin = async (email, password) => {
    return login(email, password);
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.data.token);
    setUser(res.data.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const googleLogin = async (token) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { token });
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data);
      return { success: true, data: res.data };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const githubLogin = async (code) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/github', { code });
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data);
      return { success: true, data: res.data };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const mockSocialLogin = async (provider) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/mock-social', { provider });
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data);
      return { success: true, data: res.data };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, register, googleLogin, githubLogin, mockSocialLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
