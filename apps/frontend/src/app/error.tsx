'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center">
      <h1 className="title-display text-4xl mb-4">Algo salió mal</h1>
      <p className="text-cosmic-400 mb-8">Ocurrió un error inesperado. Por favor, intenta de nuevo.</p>
      <button onClick={reset} className="btn btn-primary">Reintentar</button>
    </div>
  );
}
