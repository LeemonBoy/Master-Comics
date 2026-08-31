'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function AdminModerationPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['moderation-pending', page],
    queryFn: () => api.get(`/moderation/pending?page=${page}&limit=20`).then((r) => r.data),
    enabled: (user?.role === 'MODERATOR' || user?.role === 'ADMIN'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/moderation/comic/${id}/approve`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['moderation-pending'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.post(`/moderation/comic/${id}/reject`, { reason }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['moderation-pending'] }),
  });

  const hideMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => api.post(`/moderation/comic/${id}/hide`, { reason }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['moderation-pending'] }),
  });

  if (user?.role !== 'MODERATOR' && user?.role !== 'ADMIN') return <div className="mx-auto max-w-7xl px-4 py-16"><p>No autorizado.</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Moderación</h1>
      <div className="space-y-4">
        {data?.data?.comics?.map((comic: any) => (
          <div key={comic.id} className="card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-cosmic-200">{comic.title}</p>
               <p className="text-xs text-cosmic-500">Por {comic.author?.username ? <Link href={`/users/${comic.author.username}`} className="hover:text-cosmic-300">{comic.author.username}</Link> : comic.author?.username} — {new Date(comic.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveMutation.mutate(comic.id)} className="btn btn-primary text-xs">Aprobar</button>
              <button onClick={() => { const r = prompt('Motivo de rechazo'); if (r) rejectMutation.mutate({ id: comic.id, reason: r }); }} className="btn btn-secondary text-xs">Rechazar</button>
               <button onClick={() => { const r = prompt('Motivo de ocultación'); if (r !== null) hideMutation.mutate({ id: comic.id, reason: r }); }} className="btn btn-secondary text-xs">Ocultar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
