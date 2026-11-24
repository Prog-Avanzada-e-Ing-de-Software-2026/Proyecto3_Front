import { NavLink } from 'react-router';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getVisibleDestinations } from '../routes/navigation';

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 row-start-3 flex gap-1 overflow-x-auto border-t border-line bg-surface px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:top-0 md:bottom-auto md:row-span-2 md:row-start-1 md:h-dvh md:flex-col md:overflow-y-auto md:border-t-0 md:border-r md:py-6"
    >
      {getVisibleDestinations(user).map(({ path, label }) => (
        <NavLink
          key={path}
          to={path}
          className="flex min-h-11 min-w-11 flex-1 items-center justify-center rounded-xl px-1.5 py-2 text-center text-sm font-medium text-muted hover:text-cream aria-[current=page]:bg-lime-accent aria-[current=page]:text-canvas md:flex-none md:justify-start md:px-3 md:text-left"
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
