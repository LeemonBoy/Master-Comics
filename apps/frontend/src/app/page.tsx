'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ComicsService } from '@/lib/api';

export default function Home() {
  const { data: popular } = useQuery({
    queryKey: ['comics', 'popular'],
    queryFn: () => ComicsService.popular(12),
  });

  const { data: recent } = useQuery({
    queryKey: ['comics', 'recent'],
    queryFn: () => ComicsService.recent(12),
  });

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="mb-12">
          <h2 className="title-display mb-6">Destacados</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {popular?.map((comic: any) => (
              <Link key={comic.id} href={`/comics/${comic.id}`} className="group">
                <div className="aspect-[2/3] overflow-hidden rounded-md border border-cosmic-800 bg-cosmic-900">
                  <img
                    src={comic.coverImage || '/placeholder.png'}
                    alt={comic.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-cosmic-200">{comic.title}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="title-display mb-6">Recientemente actualizados</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recent?.map((comic: any) => (
              <Link key={comic.id} href={`/comics/${comic.id}`} className="group">
                <div className="aspect-[2/3] overflow-hidden rounded-md border border-cosmic-800 bg-cosmic-900">
                  <img
                    src={comic.coverImage || '/placeholder.png'}
                    alt={comic.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-cosmic-200">{comic.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-cosmic-800 py-8 text-center text-xs text-cosmic-600">
        © {new Date().getFullYear()} Master Comics. Todos los derechos reservados.
      </footer>
    </div>
  );
}
