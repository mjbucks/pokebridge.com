import { useTheme } from '../hooks/useTheme';

const LABEL = { light: 'Light', dark: 'Dark', system: 'Auto' } as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next = () => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');

  return (
    <button
      type="button"
      onClick={next}
      title={`Theme: ${theme}`}
      className="flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-bold uppercase tracking-wide text-slate-600 transition-colors hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    >
      {LABEL[theme]}
    </button>
  );
}
