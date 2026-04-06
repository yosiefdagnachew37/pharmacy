import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable';

interface ThemeContextType {
  theme: Theme;
  density: Density;
  setTheme: (t: Theme) => void;
  setDensity: (d: Density) => void;
  /** resolved effective theme ('light' or 'dark') */
  resolvedTheme: 'light' | 'dark';
  /** logo data URL stored in preferences */
  pharmacyLogo: string | null;
  setPharmacyLogo: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  density: 'comfortable',
  setTheme: () => {},
  setDensity: () => {},
  resolvedTheme: 'light',
  pharmacyLogo: null,
  setPharmacyLogo: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('app_theme') as Theme) || 'light';
  });

  const [density, setDensityState] = useState<Density>(() => {
    return (localStorage.getItem('app_density') as Density) || 'comfortable';
  });

  const [pharmacyLogo, setPharmacyLogoState] = useState<string | null>(() => {
    return localStorage.getItem('pharmacy_logo') || null;
  });

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? getSystemTheme() : theme;

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const root = document.documentElement;
      if (mq.matches) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Apply density class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (density === 'compact') {
      root.classList.add('density-compact');
      root.classList.remove('density-comfortable');
    } else {
      root.classList.add('density-comfortable');
      root.classList.remove('density-compact');
    }
  }, [density]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('app_theme', t);
  };

  const setDensity = (d: Density) => {
    setDensityState(d);
    localStorage.setItem('app_density', d);
  };

  const setPharmacyLogo = (url: string | null) => {
    setPharmacyLogoState(url);
    if (url) {
      localStorage.setItem('pharmacy_logo', url);
    } else {
      localStorage.removeItem('pharmacy_logo');
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      density,
      setTheme,
      setDensity,
      resolvedTheme,
      pharmacyLogo,
      setPharmacyLogo,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
