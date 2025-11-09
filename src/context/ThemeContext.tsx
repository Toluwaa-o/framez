import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export const lightTheme = {
    background: '#fff',
    surface: '#fff',
    surfaceSecondary: '#fafafa',
    text: '#262626',
    textSecondary: '#8e8e8e',
    border: '#dbdbdb',
    primary: '#3897f0',
    error: '#ed4956',
    overlay: 'rgba(0, 0, 0, 0.6)',
};

export const darkTheme = {
    background: '#000',
    surface: '#121212',
    surfaceSecondary: '#1e1e1e',
    text: '#fafafa',
    textSecondary: '#a8a8a8',
    border: '#363636',
    primary: '#3897f0',
    error: '#ed4956',
    overlay: 'rgba(255, 255, 255, 0.1)',
};

interface ThemeContextType {
    theme: typeof lightTheme;
    themeMode: ThemeMode;
    isDark: boolean;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    useEffect(() => {
        loadThemePreference();
    }, []);

    useEffect(() => {
        if (themeMode === 'system') {
            setIsDark(systemColorScheme === 'dark');
        } else {
            setIsDark(themeMode === 'dark');
        }
    }, [themeMode, systemColorScheme]);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('themeMode');
            if (savedTheme) {
                setThemeModeState(savedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem('themeMode', mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, themeMode, isDark, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};