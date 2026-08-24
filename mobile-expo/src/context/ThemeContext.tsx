import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  background: {
    primary: string;
    secondary: string;
    surface: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: string;
  accent: string;
  gradient: {
    start: string;
    end: string;
  };
}

interface ThemeContextType {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    surface: '#FAFAFA',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    tertiary: '#999999',
  },
  border: '#E0E0E0',
  accent: '#667eea',
  gradient: {
    start: '#667eea',
    end: '#764ba2',
  },
};

const darkColors: ThemeColors = {
  background: {
    primary: '#0a0a0f',
    secondary: '#1a1a2e',
    surface: '#16213e',
    elevated: '#1f2937',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
  },
  border: 'rgba(255, 255, 255, 0.1)',
  accent: '#667eea',
  gradient: {
    start: '#667eea',
    end: '#764ba2',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    loadThemePreference();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('appSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        // Convert old boolean darkMode to new ThemeMode
        if (typeof settings.app?.darkMode === 'boolean') {
          setThemeModeState(settings.app.darkMode ? 'dark' : 'light');
        }
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);

    // Save to AsyncStorage
    try {
      const saved = await AsyncStorage.getItem('appSettings');
      const settings = saved ? JSON.parse(saved) : {};
      const newSettings = {
        ...settings,
        app: {
          ...settings.app,
          darkMode: mode === 'dark' || (mode === 'auto' && systemColorScheme === 'dark'),
          themeMode: mode,
        },
      };
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  // Determine actual theme to use
  const isDarkMode =
    themeMode === 'dark' ||
    (themeMode === 'auto' && systemColorScheme === 'dark');

  const colors = isDarkMode ? darkColors : lightColors;

  const value: ThemeContextType = {
    isDarkMode,
    themeMode,
    colors,
    setThemeMode,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
