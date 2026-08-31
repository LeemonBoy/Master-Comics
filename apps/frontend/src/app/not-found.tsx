import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center">
      <h1 className="title-display text-6xl mb-4">404</h1>
      <p className="text-cosmic-400 mb-8">La página que buscas no existe o ha sido eliminada.</p>
      <Link href="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  );
}
