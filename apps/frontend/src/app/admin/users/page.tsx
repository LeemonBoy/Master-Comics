'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => api.get(`/users?page=${page}&limit=20`).then((r) => r.data),
    enabled: user?.role === 'ADMIN',
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/users/${id}/suspend`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/users/${id}/reactivate`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (user?.role !== 'ADMIN') return <div className="mx-auto max-w-7xl px-4 py-16"><p>No autorizado.</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Gestión de usuarios</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-cosmic-300">
          <thead>
            <tr className="border-b border-cosmic-800 text-left">
              <th className="p-3">Usuario</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.users?.map((u: any) => (
              <tr key={u.id} className="border-b border-cosmic-800/50">
                <td className="p-3">
                  <Link href={`/users/${u.username}`} className="hover:text-cosmic-200">
                    {u.displayName || u.username}
                  </Link>
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.isActive ? 'Activo' : 'Suspendido'}</td>
                <td className="p-3 flex gap-2">
                  {u.isActive ? (
                    <button onClick={() => suspendMutation.mutate(u.id)} className="btn btn-secondary text-xs">Suspender</button>
                  ) : (
                    <button onClick={() => reactivateMutation.mutate(u.id)} className="btn btn-primary text-xs">Reactivar</button>
                  )}
                  <button onClick={() => { if (confirm('¿Eliminar usuario?')) deleteMutation.mutate(u.id); }} className="btn btn-secondary text-xs text-red-400">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
