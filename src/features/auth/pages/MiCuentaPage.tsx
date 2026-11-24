import { useAuth } from '../hooks/useAuth';

export function MiCuentaPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold">Mi cuenta</h1>
      <dl className="grid max-w-lg gap-4 rounded-[18px] border border-line bg-surface p-5">
        <div>
          <dt className="text-sm text-muted">Usuario</dt>
          <dd className="break-all">{user.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Rol</dt>
          <dd>{user.rol}</dd>
        </div>
      </dl>
    </>
  );
}
