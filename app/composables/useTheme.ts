/**
 * useTheme - Global dark/light mode composable
 * Persists preference to localStorage, respects system preference as fallback,
 * and syncs the `dark` class on <html>.
 */

const isDarkMode = ref(false);

export function useTheme() {
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    applyTheme(isDarkMode.value);
  };

  const setDarkMode = (value: boolean) => {
    isDarkMode.value = value;
    applyTheme(value);
  };

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  const initTheme = () => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'dark' || (!saved && prefersDark);
    isDarkMode.value = shouldBeDark;
    applyTheme(shouldBeDark);

    // Listen for OS-level preference changes (only when no manual preference saved)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
      }
    });
  };

  return {
    isDarkMode: readonly(isDarkMode),
    toggleDarkMode,
    setDarkMode,
    initTheme,
  };
}
