'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ComicsService, ChaptersService, LikesService, CommentsService, FavoritesService, api } from '@/lib/api';
import Link from 'next/link';
import { ComicCard } from '@/components/comics/comic-card';
import { useAuth } from '@/lib/auth-context';

export default function ComicDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: comic } = useQuery({ queryKey: ['comic', id], queryFn: () => ComicsService.findOne(id), enabled: !!id });
  const { data: chapters } = useQuery({ queryKey: ['chapters', id], queryFn: () => ChaptersService.findMany(id), enabled: !!id });
  const { data: popular } = useQuery({ queryKey: ['popular'], queryFn: () => ComicsService.popular(6) });
  const { data: likesData } = useQuery({ queryKey: ['likes', id], queryFn: () => LikesService.count(id), enabled: !!id });
  const { data: likesMe } = useQuery({ queryKey: ['likes', 'me', id], queryFn: () => LikesService.me(id), enabled: isAuthenticated && !!id });
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { data: favData } = useQuery({ queryKey: ['favorites'], queryFn: () => FavoritesService.list(), enabled: isAuthenticated });
  const [isFav, setIsFav] = useState(false);
  const isAuthor = isAuthenticated && user?.id === comic?.author?.id;

  useEffect(() => {
    if (typeof likesData?.count === 'number') {
      setLikesCount(likesData.count);
    }
  }, [likesData]);

  useEffect(() => {
    if (likesMe && typeof likesMe.liked === 'boolean') {
      setLiked(likesMe.liked);
    }
  }, [likesMe]);

  useEffect(() => {
    if (Array.isArray(favData?.favorites)) {
      setIsFav(favData.favorites.some((fav: any) => fav.comicId === id));
    }
  }, [favData, id]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const result = await LikesService.toggle(id);
      setLiked(result.liked);
      setLikesCount(result.count);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', id] });
      queryClient.invalidateQueries({ queryKey: ['likes', 'me', id] });
    },
    onError: (err: any) => {
      setMessage(err.response?.data?.message || 'Error al actualizar like');
      setTimeout(() => setMessage(''), 3000);
    },
  });

  const { data: comments } = useQuery({ queryKey: ['comments', id], queryFn: () => CommentsService.findByComic(id), enabled: !!id });

  const favoriteMutation = useMutation({
    mutationFn: () => isFav ? FavoritesService.remove(id) : FavoritesService.add(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setIsFav((prev) => !prev);
    },
    onError: (err: any) => {
      setMessage(err.response?.data?.message || 'Error al actualizar favoritos');
      setTimeout(() => setMessage(''), 3000);
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => CommentsService.create(id, content),
    onSuccess: () => {
      setComment('');
      setMessage('Comentario agregado');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setTimeout(() => setMessage(''), 3000);
    },
  });

  const startReading = async (chapterId: string) => {
    const href = `/comics/${id}/read/${chapterId}`;
    try {
      await router.push(href);
    } catch {
      window.location.href = href;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {message && <div className="mb-4 rounded-md border border-master-700 bg-master-900 p-3 text-sm text-master-200">{message}</div>}
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="shrink-0">
          <img src={comic?.coverImage || '/placeholder.png'} alt={comic?.title} className="w-64 rounded-lg border border-cosmic-800 bg-cosmic-900" />
        </div>
        <div className="flex-1">
          <h1 className="title-display text-3xl mb-2">{comic?.title}</h1>
          <p className="text-cosmic-400 mb-4">
            Por {comic?.author?.username ? (
              <Link href={`/users/${comic.author.username}`} className="hover:text-cosmic-200">
                @{comic.author.username}
              </Link>
            ) : (
              comic?.author?.displayName || comic?.author?.username || ''
            )}
          </p>
          {comic?.description && <p className="text-sm text-cosmic-300 mb-6 whitespace-pre-line">{comic.description}</p>}
          <div className="mb-6 flex flex-wrap gap-2">
            {comic?.genres?.map((g: any) => (
              <span key={g.genre.id} className="rounded-full border border-cosmic-700 px-3 py-1 text-xs text-cosmic-300">{g.genre.name}</span>
            ))}
          </div>
          <div className="mb-6 flex flex-wrap gap-3">
            {isAuthenticated && (
              <button onClick={() => likeMutation.mutate()} className="btn btn-secondary">
                {liked ? '❤️' : '🤍'} {likesCount || likesData?.count || 0}
              </button>
            )}
            {isAuthenticated && (
              <button onClick={() => favoriteMutation.mutate()} className={`btn ${isFav ? 'btn-primary' : 'btn-secondary'}`}>
                {isFav ? '⭐ En favoritos' : '⭐ Agregar a favoritos'}
              </button>
            )}
            {isAuthor && (
              <Link href={`/user/my-comics/${comic.id}`} className="btn btn-secondary">
                Editar cómic
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <button onClick={async () => { if (confirm('¿Eliminar este cómic como administrador?')) { await api.delete(`/admin/comics/${comic.id}`); window.location.reload(); } }} className="btn btn-danger">
                Eliminar cómic (admin)
              </button>
            )}
            <select
              className="input"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
            >
              <option value="">Seleccionar capítulo</option>
              {chapters?.map((chapter: any) => (
                <option key={chapter.id} value={chapter.id}>
                  Capítulo {chapter.chapterNumber}: {chapter.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedChapter && startReading(selectedChapter)}
              className="btn btn-primary"
              disabled={!selectedChapter}
            >
              Leer capítulo
            </button>
          </div>
          <p className="text-xs text-cosmic-500">👁 {comic?.views ?? 0} vistas</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="title-display mb-4">Comentarios</h2>
        {isAuthenticated && (
          <form onSubmit={(e) => { e.preventDefault(); if (comment.trim()) commentMutation.mutate(comment); }} className="mb-6 flex gap-2">
            <input className="input" placeholder="Escribe un comentario..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit" className="btn btn-primary">Comentar</button>
          </form>
        )}
        <div className="space-y-4">
          {comments?.map((c: any) => (
            <div key={c.id} className="card p-4">
              {c.user?.username ? (
                <Link href={`/users/${c.user.username}`} className="text-sm font-medium text-cosmic-200 hover:text-cosmic-100">
                  {c.user.displayName || c.user.username}
                </Link>
              ) : (
                <p className="text-sm font-medium text-cosmic-200">{c.user.displayName || c.user.username}</p>
              )}
              <p className="text-xs text-cosmic-500 mb-2">{new Date(c.createdAt).toLocaleString()}</p>
              <p className="text-sm text-cosmic-300">{c.content}</p>
            </div>
          ))}
        </div>
      </section>

      {popular?.data?.length > 0 && (
        <section className="mt-12">
          <h2 className="title-display mb-4">También te puede interesar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {popular.data.map((c: any) => (
              <ComicCard key={c.id} comic={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
