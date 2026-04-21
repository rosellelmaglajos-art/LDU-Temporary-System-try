import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUser(res.data);
    } catch (err) {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, 
      { email, password },
      { withCredentials: true }
    );
    setUser(res.data);
    return res.data;
  };

  const register = async (email, password, name, role) => {
    const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, 
      { email, password, name, role },
      { withCredentials: true }
    );
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
