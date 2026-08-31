'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function AdminReportsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['reports', page],
    queryFn: () => api.get(`/reports?page=${page}&limit=20`).then((r) => r.data),
    enabled: (user?.role === 'MODERATOR' || user?.role === 'ADMIN'),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/reports/${id}/resolve`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/reports/${id}/reject`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  if (user?.role !== 'MODERATOR' && user?.role !== 'ADMIN') return <div className="mx-auto max-w-7xl px-4 py-16"><p>No autorizado.</p></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Reportes</h1>
      <div className="space-y-4">
        {data?.data?.reports?.map((report: any) => (
          <div key={report.id} className="card p-4">
            <p className="font-medium text-cosmic-200">Reporte: {report.reason}</p>
             <p className="text-xs text-cosmic-500">Por {report.reporter?.username ? <Link href={`/users/${report.reporter.username}`} className="hover:text-cosmic-300">{report.reporter.username}</Link> : report.reporter?.username} — {new Date(report.createdAt).toLocaleDateString()}</p>
            {report.comic && <p className="text-xs text-cosmic-400">Cómic: {report.comic.title}</p>}
            <div className="mt-3 flex gap-2">
              <button onClick={() => resolveMutation.mutate(report.id)} className="btn btn-primary text-xs">Resolver</button>
              <button onClick={() => rejectMutation.mutate(report.id)} className="btn btn-secondary text-xs">Descartar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
