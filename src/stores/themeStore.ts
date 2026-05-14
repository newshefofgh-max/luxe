import { create } from 'zustand';

interface ThemeStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// No persistence — light mode is always the default on every page load.
// The toggle works for the current session only.
export const useThemeStore = create<ThemeStore>()((set) => ({
  theme: 'light',
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
}));
