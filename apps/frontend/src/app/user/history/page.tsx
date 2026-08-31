'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { HistoryService } from '@/lib/api';
import { ComicCard } from '@/components/comics/comic-card';
import { useAuth } from '@/lib/auth-context';

export default function HistoryPage() {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery({ queryKey: ['history'], queryFn: () => HistoryService.list(), enabled: isAuthenticated });

  if (!isAuthenticated) return <div className="mx-auto max-w-7xl px-4 py-16"><p>Inicia sesión para ver tu historial.</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Historial de lectura</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data?.data?.history?.map((h: any) => (
          <div key={`${h.comic.id}-${h.chapterId}`}>
            <ComicCard comic={h.comic} />
            <p className="mt-1 text-xs text-cosmic-500">Capítulo {h.lastPageNumber}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
