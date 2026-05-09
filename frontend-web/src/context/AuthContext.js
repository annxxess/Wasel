import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('wasel_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const login = (userData, token) => {
    localStorage.setItem('wasel_token', token);
    localStorage.setItem('wasel_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('wasel_token');
    localStorage.removeItem('wasel_user');
    setUser(null);
  };

  const contextValue = { user, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}