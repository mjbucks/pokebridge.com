import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 sm:px-6">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="PokéBridge" className="h-10 w-10 object-contain" />
        <span className="font-display text-xl font-extrabold text-brand-600 dark:text-brand-300">PokéBridge</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
