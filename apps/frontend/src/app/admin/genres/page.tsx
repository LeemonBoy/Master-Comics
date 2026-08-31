'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AdminGenresPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data } = useQuery({
    queryKey: ['admin-genres'],
    queryFn: async () => (await api.get('/genres')).data,
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/genres', data).then((r) => r.data),
    onSuccess: () => {
      setName('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
    },
  });

  if (user?.role !== 'ADMIN') return <div className="mx-auto max-w-7xl px-4 py-16"><p>No autorizado.</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Géneros</h1>
      <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name, description }); }} className="mb-8 flex flex-col gap-3 md:flex-row">
        <input className="input" placeholder="Nombre del género" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="input" placeholder="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit" className="btn btn-primary">Crear género</button>
      </form>
      <div className="card divide-y divide-cosmic-800">
        {data?.data?.map((g: any) => (
          <div key={g.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-cosmic-200">{g.name}</p>
              <p className="text-xs text-cosmic-500">{g.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
