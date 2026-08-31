'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AdminAdsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['admin-ads', page],
    queryFn: () => api.get('/ads?page=1&limit=50').then((r) => r.data),
    enabled: user?.role === 'ADMIN',
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.patch(`/ads/${id}`, { isActive }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-ads'] }),
  });

  if (user?.role !== 'ADMIN') return <div className="mx-auto max-w-7xl px-4 py-16"><p>No autorizado.</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Publicidad</h1>
      <div className="space-y-4">
        {data?.data?.ads?.map((ad: any) => (
          <div key={ad.id} className="card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-cosmic-200">{ad.name}</p>
              <p className="text-xs text-cosmic-500">{ad.placement} — {ad.isActive ? 'Activo' : 'Inactivo'}</p>
            </div>
            <button onClick={() => toggleMutation.mutate({ id: ad.id, isActive: !ad.isActive })} className="btn btn-secondary text-xs">
              {ad.isActive ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
