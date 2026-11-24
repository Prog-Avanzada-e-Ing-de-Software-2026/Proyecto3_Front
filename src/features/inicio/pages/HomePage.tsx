import { Link } from 'react-router';

export function HomePage({
  destinations,
}: {
  destinations: readonly { path: string; label: string }[];
}) {
  return (
    <>
      <h1 className="mb-5 text-2xl font-bold">Inicio</h1>
      {destinations.length === 0 ? (
        <p className="text-muted">No hay secciones disponibles.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {destinations.map(({ path, label }) => (
            <li key={path}>
              <Link
                className="block rounded-[18px] border border-line bg-surface p-4 hover:text-lime-accent"
                to={path}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
