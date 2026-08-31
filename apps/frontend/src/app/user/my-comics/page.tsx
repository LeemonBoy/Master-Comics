'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { api, GenresService } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function MyComicsPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => GenresService.findAll(),
  });

  const { data } = useQuery({
    queryKey: ['my-comics', user?.id],
    queryFn: async () => (await api.get(`/comics?authorId=${user!.id}&limit=100`)).data,
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/comics', data).then((r) => r.data),
    onSuccess: (newComic) => {
      setTitle('');
      setSelectedGenres([]);
      setSuccess('Cómic creado. Ahora puedes editar su información y subir páginas.');
      queryClient.invalidateQueries({ queryKey: ['my-comics'] });
      router.push(`/user/my-comics/${newComic.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (comicId: string) => api.delete(`/comics/${comicId}`).then((r) => r.data),
    onSuccess: () => {
      setSuccess('Cómic eliminado');
      queryClient.invalidateQueries({ queryKey: ['my-comics'] });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setSuccess('');
      alert(err.response?.data?.message || 'Error al eliminar cómic');
    },
  });

  if (!user) return <div className="mx-auto max-w-7xl px-4 py-16"><p>Inicia sesión.</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="title-display">Mis cómics</h1>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ title, genreIds: selectedGenres }); }} className="flex flex-col gap-2">
          <input className="input" placeholder="Nuevo título" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Géneros</label>
            <select
              multiple
              size={6}
              value={selectedGenres}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map((option) => option.value);
                setSelectedGenres(values);
              }}
              className="input h-auto"
            >
              {(genresData || []).map((genre: any) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
            {selectedGenres.length > 0 && (
              <p className="mt-1 text-xs text-cosmic-400">
                Seleccionados: {(genresData || []).filter((g: any) => selectedGenres.includes(g.id)).map((g: any) => g.name).join(', ')}
              </p>
            )}
          </div>
          <button type="submit" className="btn btn-primary">Crear borrador</button>
        </form>
      </div>
      {success && <p className="mb-4 text-sm text-green-400">{success}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data?.comics?.map((comic: any) => (
          <div key={comic.id} className="group">
            <Link href={`/user/my-comics/${comic.id}`} className="block">
              <div className="aspect-[2/3] overflow-hidden rounded-md border border-cosmic-800 bg-cosmic-900">
                <img src={comic.coverImage || '/placeholder.png'} alt={comic.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-cosmic-200">{comic.title}</p>
              <p className="text-xs text-cosmic-500">{comic.status}</p>
            </Link>
            <button onClick={() => { if (confirm('¿Eliminar este cómic? Esta acción no se puede deshacer.')) deleteMutation.mutate(comic.id); }} className="mt-2 w-full btn btn-danger text-xs" disabled={deleteMutation.isPending}>
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
