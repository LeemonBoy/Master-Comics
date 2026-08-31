'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api, AdminService, ComicsService, CommentsService } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function AdminManagePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'comics' | 'comments'>('comics');

  const { data: comicsData, isLoading: comicsLoading, error: comicsError } = useQuery({
    queryKey: ['admin-comics'],
    queryFn: () => ComicsService.findMany({ limit: 100, all: true }),
    enabled: user?.role === 'ADMIN' && tab === 'comics',
  });

  const { data: commentsData, isLoading: commentsLoading, error: commentsError } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: () => CommentsService.findMany(1, 100),
    enabled: user?.role === 'ADMIN' && tab === 'comments',
  });

  const deleteComicMutation = useMutation({
    mutationFn: (id: string) => AdminService.deleteComic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    },
  });

  if (user?.role !== 'ADMIN') return <div className="mx-auto max-w-7xl px-4 py-16"><p>No autorizado.</p></div>;

  const comics = comicsData?.comics || [];
  const comments = commentsData?.comments || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Administración</h1>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setTab('comics')} className={`btn ${tab === 'comics' ? 'btn-primary' : 'btn-secondary'}`}>Cómics</button>
        <button onClick={() => setTab('comments')} className={`btn ${tab === 'comments' ? 'btn-primary' : 'btn-secondary'}`}>Comentarios</button>
      </div>

      {tab === 'comics' && (
        <div className="space-y-3">
          {comicsLoading && <p className="text-cosmic-400">Cargando cómics...</p>}
          {comicsError && <p className="text-red-400">Error al cargar cómics.</p>}
          {!comicsLoading && comics.length === 0 && <p className="text-cosmic-500">No hay cómics.</p>}
          {comics.map((comic: any) => (
            <div key={comic.id} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-cosmic-200">{comic.title}</p>
                <p className="text-xs text-cosmic-500">Por {comic.author?.username ? <Link href={`/users/${comic.author.username}`} className="hover:text-cosmic-300">{comic.author.username}</Link> : comic.author?.username} — {comic.status} — {comic.views || 0} vistas</p>
              </div>
              <button onClick={() => { if (confirm('¿Eliminar este cómic?')) deleteComicMutation.mutate(comic.id); }} className="btn btn-danger text-xs">Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'comments' && (
        <div className="space-y-3">
          {commentsLoading && <p className="text-cosmic-400">Cargando comentarios...</p>}
          {commentsError && <p className="text-red-400">Error al cargar comentarios.</p>}
          {!commentsLoading && comments.length === 0 && <p className="text-cosmic-500">No hay comentarios.</p>}
          {comments.map((comment: any) => (
            <div key={comment.id} className="card flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-cosmic-200">{comment.content}</p>
                  <p className="text-xs text-cosmic-500">Por {comment.user?.username ? <Link href={`/users/${comment.user.username}`} className="hover:text-cosmic-300">{comment.user.username}</Link> : comment.user?.username} — {new Date(comment.createdAt).toLocaleDateString()} — en {comment.comic?.title || 'cómic eliminado'}</p>
              </div>
              {comment.comic?.id && (
                <button onClick={() => { if (confirm('¿Eliminar el cómic asociado a este comentario?')) deleteComicMutation.mutate(comment.comic.id); }} className="btn btn-danger text-xs">Eliminar cómic</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
