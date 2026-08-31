'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ComicsService } from '@/lib/api';

export default function ComicsPage() {
  const { data } = useQuery({ queryKey: ['comics'], queryFn: () => ComicsService.findMany({ page: 1, limit: 50 }) });

  const comics = Array.isArray(data?.comics) ? data.comics : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Explorar cómics</h1>
      {comics.length === 0 ? (
        <p className="text-cosmic-500">No hay cómics publicados por el momento.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {comics.map((comic: any) => (
            <div key={comic.id} className="group">
              <Link href={`/comics/${comic.id}`}>
                <div className="aspect-[2/3] overflow-hidden rounded-md border border-cosmic-800 bg-cosmic-900">
                  <img src={comic.coverImage || '/placeholder.png'} alt={comic.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-cosmic-200">{comic.title}</p>
              </Link>
              {comic.author?.username ? (
                <Link href={`/users/${comic.author.username}`} className="text-xs text-cosmic-500 hover:text-cosmic-300">
                  @{comic.author.username}
                </Link>
              ) : (
                <p className="text-xs text-cosmic-500">{comic.author?.displayName || comic.author?.username || 'Desconocido'}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
