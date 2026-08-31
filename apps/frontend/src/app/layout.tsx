import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/navbar';
import QueryClientProviderComponent from '@/components/providers/query-client-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Master Comics',
  description: 'Plataforma de cómics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${cinzel.variable} min-h-screen`}>
        <QueryClientProviderComponent>
          <AuthProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-60px)]">{children}</main>
          </AuthProvider>
        </QueryClientProviderComponent>
      </body>
    </html>
  );
}
