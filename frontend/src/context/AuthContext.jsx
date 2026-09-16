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
        }
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
    const res = await api.post('/auth/admin-login', { email, password });
    localStorage.setItem('token', res.data.data.token);
    setUser(res.data.data);
    return res.data;
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

  const mockSocialLogin = async (provider) => {
    // Simulate a brief delay to mimic OAuth redirect and verification
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful backend authentication
    const fakeToken = "mock_social_jwt_token_12345";
    const fakeUser = {
      _id: "mock_social_user",
      name: provider === "Google" ? "Google User" : "GitHub User",
      email: `${provider.toLowerCase()}@example.com`,
      role: "admin", // Granting admin role for testing ease
    };
    
    localStorage.setItem('token', fakeToken);
    setUser(fakeUser);
    setLoading(false);
    return { success: true, data: { user: fakeUser, token: fakeToken } };
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, register, mockSocialLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
