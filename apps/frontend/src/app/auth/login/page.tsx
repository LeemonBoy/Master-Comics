'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, setTokens } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setTokens(data.accessToken, data.refreshToken);
      login(data.accessToken, data.refreshToken, data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h1 className="title-display text-center mb-6">Iniciar sesión</h1>
        {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Contraseña</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-full">Entrar</button>
        </form>
        <p className="mt-4 text-center text-sm text-cosmic-400">
          ¿No tienes cuenta? <Link href="/auth/register" className="link">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
