'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/moderation/dashboard').then((r) => r.data),
    enabled: user?.role === 'ADMIN',
  });

  if (user?.role !== 'ADMIN') return <div className="mx-auto max-w-7xl px-4 py-16"><p>No autorizado.</p></div>;

  const stats = data?.stats || {};
  const topComics = data?.topComics || [];
  const topCreators = data?.topCreators || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="title-display mb-6">Panel de administración</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Usuarios', value: stats.totalUsers },
          { label: 'Cómics', value: stats.totalComics },
          { label: 'Capítulos', value: stats.totalChapters },
          { label: 'Páginas', value: stats.totalPages },
          { label: 'Pendientes', value: stats.pendingModeration },
          { label: 'Reportes', value: stats.pendingReports },
        ].map((item) => (
          <div key={item.label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-cosmic-100">{item.value ?? 0}</p>
            <p className="text-xs text-cosmic-400">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="title-display mb-4">Cómics más leídos</h2>
          <ul className="space-y-2 text-sm text-cosmic-300">
            {topComics.map((c: any) => (
              <li key={c.id} className="flex justify-between"><span>{c.title}</span><span className="text-cosmic-500">{c.views} vistas</span></li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="title-display mb-4">Creadores más activos</h2>
          <ul className="space-y-2 text-sm text-cosmic-300">
            {topCreators.map((u: any) => (
              <li key={u.id} className="flex justify-between"><Link href={`/users/${u.username}`} className="hover:text-cosmic-200">{u.displayName || u.username}</Link><span className="text-cosmic-500">{u._count.authoredComics} cómics</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
