'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-cosmic-800 bg-cosmic-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="title-display text-xl">
          Master Comics
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/comics/search" className="link">
            Buscar
          </Link>
          <Link href="/comics" className="link">
            Explorar
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/user/profile" className="link">
                {user?.displayName || user?.username}
              </Link>
              <Link href="/user/favorites" className="link">
                Favoritos
              </Link>
               <Link href="/user/my-comics" className="link">
                 Mis cómics
               </Link>
               {user?.role === 'ADMIN' && (
                <>
                  <Link href="/admin" className="link text-cosmic-500">
                    Panel
                  </Link>
                  <Link href="/admin/manage" className="link text-cosmic-500">
                    Gestionar
                  </Link>
                  <Link href="/admin/reports" className="link text-cosmic-500">
                    Reportes
                  </Link>
                  <Link href="/admin/moderation" className="link text-cosmic-500">
                    Moderación
                  </Link>
                  <Link href="/admin/users" className="link text-cosmic-500">
                    Usuarios
                  </Link>
                </>
              )}
              <button onClick={logout} className="btn btn-secondary">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="link">
                Iniciar sesión
              </Link>
              <Link href="/auth/register" className="btn btn-primary">
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
