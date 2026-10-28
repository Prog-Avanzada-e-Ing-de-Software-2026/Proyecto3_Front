import { Routes, Route, Link } from 'react-router';

function Home() {
  return <h1>Inicio</h1>;
}

function Usuarios() {
  return <h1>Usuarios</h1>;
}

export default function App() {
  return (
    <>
      <nav className="flex gap-4 p-4">
        <Link to="/">Inicio</Link>
        <Link to="/usuarios">Usuarios</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/usuarios" element={<Usuarios />} />
      </Routes>
    </>
  );
}
