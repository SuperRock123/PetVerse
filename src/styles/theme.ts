export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export const lightTheme: ThemeColors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

export const darkTheme: ThemeColors = {
  primary: '#81C784',
  secondary: '#64B5F6',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  error: '#EF5350',
  success: '#81C784',
  warning: '#FFB74D',
  info: '#64B5F6',
};

export const petTheme: ThemeColors = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#FFF9F5',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  border: '#FFE0D5',
  error: '#FF6B6B',
  success: '#4ECDC4',
  warning: '#FFD166',
  info: '#6A0572',
};

export type ThemeType = 'light' | 'dark' | 'pet';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  pet: petTheme,
};
