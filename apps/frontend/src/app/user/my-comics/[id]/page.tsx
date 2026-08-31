import MyComicEditView from './view';

export async function generateStaticParams() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiBase}/api/comics?limit=1000`, { next: { revalidate: 0 } });
    return [];
  } catch {
    return [];
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  return <MyComicEditView id={params.id} />;
}
