import { ref, computed } from 'vue';
import { ThemeType, themes } from '@/styles/theme';

export function useThemeStore() {
  const currentTheme = ref<ThemeType>('light');

  const themeColors = computed(() => {
    return themes[currentTheme.value];
  });

  const setTheme = (theme: ThemeType) => {
    currentTheme.value = theme;
    updateDocumentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  const updateDocumentTheme = (theme: ThemeType) => {
    const colors = themes[theme];
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') as ThemeType || 'light';
    setTheme(savedTheme);
  };

  return {
    currentTheme,
    themeColors,
    setTheme,
    loadTheme,
  };
}
