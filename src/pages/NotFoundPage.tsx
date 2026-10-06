import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-4 pt-16 text-center">
      <h1 className="font-display text-2xl font-extrabold">Page not found</h1>
      <Link to="/" className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white">
        Back home
      </Link>
    </div>
  );
}
