'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AdminTagsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');

  const { data } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async () => (await api.get('/tags')).data,
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/tags', data).then((r) => r.data),
    onSuccess: () => {
      setName('');
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
    },
  });

  if (user?.role !== 'ADMIN') return <div className="mx-auto max-w-7xl px-4 py-16"><p>No autorizado.</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Etiquetas</h1>
      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name }); }} className="mb-8 flex flex-col gap-3 md:flex-row">
        <input className="input" placeholder="Nombre de la etiqueta" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit" className="btn btn-primary">Crear etiqueta</button>
      </form>
      <div className="card divide-y divide-cosmic-800">
        {data?.data?.map((t: any) => (
          <div key={t.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-cosmic-200">{t.name}</p>
              <p className="text-xs text-cosmic-500">{t.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
