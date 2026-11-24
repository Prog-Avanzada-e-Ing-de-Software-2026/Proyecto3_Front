import { NavLink, Outlet } from 'react-router';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] md:grid-cols-[14rem_minmax(0,1fr)] md:grid-rows-[auto_1fr]">
      <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-5 py-3 md:col-start-2">
        <span className="text-lg font-bold tracking-tight">HercFit</span>
        <NavLink
          to="/mi-cuenta"
          className="rounded-xl px-3 py-2 text-sm font-medium text-muted hover:text-cream aria-[current=page]:text-lime-accent"
        >
          Mi cuenta
        </NavLink>
      </header>
      <main className="min-w-0 px-5 py-7 md:col-start-2 md:px-8">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
}
