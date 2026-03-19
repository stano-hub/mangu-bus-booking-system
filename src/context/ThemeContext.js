// src/context/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  computedTheme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    return (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'light';
  });

  const [computedTheme, setComputedTheme] = useState('light');

  useEffect(() => {
    let result = 'light';
    if (theme === 'system') {
      result = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      result = theme;
    }
    setComputedTheme(result);
    document.documentElement.setAttribute('data-theme', result);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, computedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
