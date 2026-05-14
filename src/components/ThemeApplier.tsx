'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export default function ThemeApplier() {
  useEffect(() => {
    // Apply initial theme class (always 'light' since there's no persistence)
    const { theme } = useThemeStore.getState();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Subscribe to future toggles
    return useThemeStore.subscribe((state) => {
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }, []);

  return null;
}
