'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FavoritesService } from '@/lib/api';
import { ComicCard } from '@/components/comics/comic-card';
import { useAuth } from '@/lib/auth-context';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const { data, refetch } = useQuery({ queryKey: ['favorites'], queryFn: () => FavoritesService.list(), enabled: isAuthenticated });

  if (!isAuthenticated) return <div className="mx-auto max-w-7xl px-4 py-16"><p>Inicia sesión para ver tus favoritos.</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Mis favoritos</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data?.favorites?.map((fav: any) => (
          <ComicCard key={fav.comic.id} comic={fav.comic} />
        ))}
      </div>
      {!data?.favorites?.length && <p className="mt-8 text-center text-cosmic-500">No tienes favoritos aún.</p>}
    </div>
  );
}
