'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ComicsService, GenresService, TagsService } from '@/lib/api';
import Link from 'next/link';
import { ComicCard } from '@/components/comics/comic-card';

export default function SearchPage() {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('createdAt_DESC');

  const { data: genres } = useQuery({ queryKey: ['genres'], queryFn: GenresService.findAll });
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: TagsService.findAll });
  const { data: results } = useQuery({
    queryKey: ['search', search, genre, tag, sort],
    queryFn: () => ComicsService.findMany({ search, genre, tag, sort, page: 1, limit: 50 }),
    enabled: !!search || !!genre || !!tag,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Buscar cómics</h1>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <input className="input md:col-span-2" placeholder="Buscar por título, autor o artista..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Todos los géneros</option>
          {genres?.map((g: any) => <option key={g.id} value={g.slug}>{g.name}</option>)}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="createdAt_DESC">Más recientes</option>
          <option value="views_DESC">Más populares</option>
          <option value="title_ASC">A-Z</option>
          <option value="title_DESC">Z-A</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {results?.comics?.map((comic: any) => (
          <ComicCard key={comic.id} comic={comic} />
        ))}
      </div>
      {(!results?.comics?.length && (search || genre || tag)) && <p className="mt-8 text-center text-cosmic-500">No se encontraron resultados.</p>}
    </div>
  );
}
