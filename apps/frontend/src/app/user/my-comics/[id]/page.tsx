import MyComicEditView from './view';

export async function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: { id: string } }) {
  return <MyComicEditView id={params.id} />;
}
