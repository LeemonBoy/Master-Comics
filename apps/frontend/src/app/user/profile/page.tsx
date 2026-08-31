'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ displayName: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => (await api.get('/users/me')).data,
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setForm({ displayName: profile.displayName || '', bio: profile.bio || '' });
      if (profile.avatar) setAvatarPreview(profile.avatar);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => api.patch('/users/me', data).then((r) => r.data),
    onSuccess: () => {
      setMessage('Perfil actualizado');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user', user?.username] });
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al actualizar perfil');
      setMessage('');
    },
  });

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append('file', avatarFile);
    try {
      const res = await api.post('/storage/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data.url || res.data.path;
      await updateMutation.mutateAsync({ ...form, avatar: url });
      setAvatarPreview(url);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['user', user?.username] });
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir avatar');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (avatarFile) {
      uploadAvatar();
    } else {
      updateMutation.mutate(form);
    }
  };

  if (!isAuthenticated) return <div className="mx-auto max-w-2xl px-4 py-16"><p>Inicia sesión para ver tu perfil.</p></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="card p-8">
        <h1 className="title-display mb-6">Mi perfil</h1>
        {message && <p className="mb-4 text-sm text-green-400">{message}</p>}
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-cosmic-700 bg-cosmic-900">
              {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl text-cosmic-500">{(user?.displayName || user?.username || '?')[0].toUpperCase()}</div>}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); } }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary text-xs">Cambiar avatar</button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Nombre para mostrar</label>
            <input className="input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Biografía</label>
            <textarea className="input" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
