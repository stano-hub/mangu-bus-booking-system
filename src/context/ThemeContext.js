// src/context/ThemeContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  computedTheme: 'light',
  setTheme: () => {},
});

function applyThemeAttr(nextTheme) {
  document.documentElement.setAttribute('data-theme', nextTheme);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system'); // 'light' | 'dark' | 'system'

  // Listen to system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setTheme(stored);
    }
  }, []);

  const computedTheme = useMemo(() => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  useEffect(() => {
    applyThemeAttr(computedTheme);
    localStorage.setItem('theme', theme);
  }, [computedTheme, theme]);

  // Update on system theme change when in system mode
  useEffect(() => {
    if (theme !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemeAttr(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const value = useMemo(() => ({ theme, computedTheme, setTheme }), [theme, computedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
