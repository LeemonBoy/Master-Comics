import PublicProfileView from './view';

export async function generateStaticParams() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiBase}/api/users?page=1&limit=1000`, { next: { revalidate: 0 } });
    const data = await res.json();
    return (data.users || []).map((u: any) => ({ username: u.username }));
  } catch {
    return [];
  }
}

export default async function Page({ params }: { params: { username: string } }) {
  return <PublicProfileView params={params} />;
}
