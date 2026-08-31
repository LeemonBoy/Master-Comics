import ReaderView from './view';

export async function generateStaticParams() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const params: { id: string; chapterId: string }[] = [];
  try {
    const res = await fetch(`${apiBase}/api/comics?all=true&limit=1000`, { next: { revalidate: 0 } });
    const data = await res.json();
    for (const comic of (data.comics || [])) {
      const chRes = await fetch(`${apiBase}/api/chapters/comic/${comic.id}`, { next: { revalidate: 0 } });
      const chapters = await chRes.json();
      for (const ch of (chapters || [])) {
        params.push({ id: comic.id, chapterId: ch.id });
      }
    }
  } catch {
    return [];
  }
  return params;
}

export default async function Page({ params }: { params: { id: string; chapterId: string } }) {
  return <ReaderView comicId={params.id} chapterId={params.chapterId} />;
}
