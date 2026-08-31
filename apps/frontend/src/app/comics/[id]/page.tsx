import ComicDetailView from './view';

export async function generateStaticParams() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiBase}/api/comics?limit=1000`, { next: { revalidate: 0 } });
    const data = await res.json();
    return (data.comics || []).map((comic: any) => ({ id: comic.id }));
  } catch {
    return [];
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  return <ComicDetailView id={params.id} />;
}
