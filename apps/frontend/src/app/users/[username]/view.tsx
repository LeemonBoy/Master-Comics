'use client';

import { useQuery } from '@tanstack/react-query';
import { ComicCard } from '@/components/comics/comic-card';
import { UsersService, ComicsService } from '@/lib/api';
import Link from 'next/link';

export default function PublicProfileView({ params }: { params: { username: string } }) {
  const { username } = params;
  const { data: user } = useQuery({ queryKey: ['user', username], queryFn: () => UsersService.findByUsername(username as string) });
  const { data: comics } = useQuery({ queryKey: ['user-comics', username], queryFn: () => ComicsService.byAuthor(user?.id || ''), enabled: !!user?.id });

  if (!user) return <div className="mx-auto max-w-7xl px-4 py-16"><p>Cargando perfil...</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="shrink-0">
          <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-cosmic-700 bg-cosmic-900 md:h-40 md:w-40">
            {user.avatar ? <img src={user.avatar} alt={user.displayName || user.username} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-3xl text-cosmic-500">{(user.displayName || user.username)[0].toUpperCase()}</div>}
          </div>
        </div>
        <div>
          <h1 className="title-display text-3xl">{user.displayName || user.username}</h1>
          <p className="text-cosmic-400">@{user.username}</p>
          {user.bio && <p className="mt-4 text-sm text-cosmic-300">{user.bio}</p>}
          <div className="mt-4 flex gap-4 text-sm text-cosmic-500">
            <span>{user._count?.authoredComics || 0} cómics</span>
            <span>Miembro desde {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <section className="mt-12">
        <h2 className="title-display mb-6">Cómics publicados</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {comics?.comics?.map((comic: any) => <ComicCard key={comic.id} comic={comic} />)}
        </div>
      </section>
    </div>
  );
}
