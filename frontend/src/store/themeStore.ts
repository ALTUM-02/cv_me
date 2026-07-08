import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

const applyTheme = (theme: Theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem('resumeforge-theme');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.theme === 'dark' || parsed?.state?.theme === 'light') {
        return parsed.state.theme;
      }
    } catch {
      // Ignore invalid persisted values and fall back to the system preference.
    }
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getPreferredTheme(),
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light';
          applyTheme(next);
          return { theme: next };
        }),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      initializeTheme: () => {
        const theme = getPreferredTheme();
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'resumeforge-theme',
      onRehydrateStorage: () => {
        return (state) => {
          applyTheme(state?.theme ?? getPreferredTheme());
        };
      },
    }
  )
);
