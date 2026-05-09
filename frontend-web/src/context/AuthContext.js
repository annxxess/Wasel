// ============================================
// WASEL | واصل - Auth Context
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('wasel_token'));
  const [role, setRole]       = useState(localStorage.getItem('wasel_role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('wasel_user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  const login = (userData, authToken, userRole) => {
    setUser(userData);
    setToken(authToken);
    setRole(userRole);
    localStorage.setItem('wasel_token', authToken);
    localStorage.setItem('wasel_user', JSON.stringify(userData));
    localStorage.setItem('wasel_role', userRole);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('wasel_token');
    localStorage.removeItem('wasel_user');
    localStorage.removeItem('wasel_role');
  };
  // ... باقي الكود

  const contextValue = { user, token, role, loading, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);