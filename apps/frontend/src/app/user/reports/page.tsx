'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function UserReportsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [comicId, setComicId] = useState('');
  const [success, setSuccess] = useState('');

  const { data } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => (await api.get('/reports')).data,
    enabled: (user?.role === 'MODERATOR' || user?.role === 'ADMIN'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/reports', data).then((r) => r.data),
    onSuccess: () => {
      setSuccess('Reporte enviado');
      setReason('');
      setDescription('');
      setComicId('');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  if (!user) return <div className="mx-auto max-w-2xl px-4 py-16"><p>Inicia sesión para enviar un reporte.</p></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="title-display mb-6">Reportar contenido</h1>
      {success && <p className="mb-4 text-sm text-green-400">{success}</p>}
      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ reason, description, comicId }); }} className="card space-y-4 p-8">
        <div>
          <label className="mb-1 block text-sm text-cosmic-300">ID del cómic (opcional)</label>
          <input className="input" value={comicId} onChange={(e) => setComicId(e.target.value)} placeholder="Ej: comic-123" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-cosmic-300">Motivo</label>
          <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} required maxLength={100} placeholder="Ej: Contenido inapropiado" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-cosmic-300">Descripción</label>
          <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} placeholder="Detalles adicionales..." />
        </div>
        <button type="submit" className="btn btn-primary w-full">Enviar reporte</button>
      </form>
    </div>
  );
}
