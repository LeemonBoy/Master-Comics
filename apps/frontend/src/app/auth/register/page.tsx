'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, setTokens } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const router = useRouter();
  const { login } = useAuth();

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    try {
      const { data } = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
      setUsernameStatus(data.taken ? 'taken' : 'available');
    } catch {
      setUsernameStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (usernameStatus === 'taken') {
      setError('El nombre de usuario ya está en uso');
      return;
    }
    try {
      const { data } = await api.post('/auth/register', form);
      setTokens(data.accessToken, data.refreshToken);
      login(data.accessToken, data.refreshToken, data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h1 className="title-display text-center mb-6">Crear cuenta</h1>
        {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Username</label>
            <input
              className="input"
              value={form.username}
              onChange={(e) => {
                setForm({ ...form, username: e.target.value });
                checkUsername(e.target.value);
              }}
              required
            />
            {usernameStatus === 'checking' && <p className="mt-1 text-xs text-cosmic-400">Verificando...</p>}
            {usernameStatus === 'available' && <p className="mt-1 text-xs text-green-400">Usuario disponible</p>}
            {usernameStatus === 'taken' && <p className="mt-1 text-xs text-red-400">Usuario ya registrado</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Nombre para mostrar</label>
            <input className="input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Contraseña</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={usernameStatus === 'taken'}>Registrarse</button>
        </form>
        <p className="mt-4 text-center text-sm text-cosmic-400">
          ¿Ya tienes cuenta? <Link href="/auth/login" className="link">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
