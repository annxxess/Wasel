// ============================================
// WASEL | واصل - Theme Context (Dark/Light Mode)
// Created by Marref Mohammed Anas
// © 2026 WASEL. All Rights Reserved.
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(
    localStorage.getItem('wasel_theme') !== 'light'
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#0f172a';
      document.documentElement.style.color = '#f8fafc';
      localStorage.setItem('wasel_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f8fafc';
      document.documentElement.style.color = '#0f172a';
      localStorage.setItem('wasel_theme', 'light');
    }
  }, [dark]);

  const toggleTheme = () => setDark(prev => !prev);

  const themeValue = { dark, toggleTheme };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);