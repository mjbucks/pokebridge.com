import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { HowToPlayModal } from './HowToPlayModal';

const NAV_LINKS = [
  { to: '/daily', label: 'Daily' },
  { to: '/solo', label: 'Solo Random' },
];

export function Header() {
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-slate-100 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-8 sm:py-3">
        <NavLink to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img src="/logo.png" alt="PokéBridge" className="h-9 w-9 shrink-0 object-contain sm:h-14 sm:w-14" />
          <span className="truncate font-display text-base font-bold text-brand-700 dark:text-brand-300 sm:text-3xl">
            PokéBridge
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-brand-900/30'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setShowHowTo(true)}
            className="rounded-full border-2 border-slate-200 px-2 py-1.5 font-display text-[10px] font-bold uppercase tracking-wide text-slate-600 transition-colors hover:border-accent-400 hover:text-accent-600 dark:border-slate-700 dark:text-slate-300 sm:px-4 sm:py-2 sm:text-sm"
          >
            <span className="sm:hidden">Help</span>
            <span className="hidden sm:inline">How to Play</span>
          </button>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 dark:border-slate-800 sm:hidden">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-3 py-1.5 font-display text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-brand-50 dark:text-slate-300 dark:hover:bg-brand-900/30'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {showHowTo && <HowToPlayModal onClose={() => setShowHowTo(false)} />}
    </header>
  );
}
