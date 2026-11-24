import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <main className="grid min-h-dvh place-items-center p-5">
      <div className="w-full max-w-md rounded-[18px] border border-line bg-surface p-7 md:p-9">
        <p className="mb-5 text-lg font-bold tracking-tight text-lime-accent">
          HercFit
        </p>
        <Outlet />
      </div>
    </main>
  );
}
