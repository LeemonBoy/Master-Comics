'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api, GenresService } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function MyComicEditView({ id }: { id: string }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pagePreviews, setPagePreviews] = useState<{ chapterId: string; files: File[]; previews: string[] }[]>([]);
  const queryClient = useQueryClient();

  const { data: genresData, isLoading: genresLoading, error: genresError } = useQuery({
    queryKey: ['genres'],
    queryFn: () => GenresService.findAll(),
  });

  const { data: comic } = useQuery({
    queryKey: ['my-comic', id],
    queryFn: async () => (await api.get(`/comics/${id}`)).data,
    enabled: !!id,
  });

  useEffect(() => {
    if (comic) {
      setTitle(comic.title);
      setDescription(comic.description || '');
      setStatus(comic.status);
      if (comic.coverImage) setCoverPreview(getFullImageUrl(comic.coverImage));
      if (comic.genres) setSelectedGenres(comic.genres.map((g: any) => g.genreId));
    }
  }, [comic]);

  const { data: chapters } = useQuery({
    queryKey: ['chapters', id],
    queryFn: async () => (await api.get(`/chapters/comic/${id}`)).data,
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/comics/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      setMessage('Información guardada');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['my-comic'] });
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al guardar');
      setMessage('');
    },
  });

  const createChapterMutation = useMutation({
    mutationFn: (chapterTitle: string) => api.post(`/chapters/comic/${id}`, { title: chapterTitle, chapterNumber: (chapters?.length || 0) + 1, isPublished: false }).then((r) => r.data),
    onSuccess: () => {
      setMessage('Capítulo creado');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al crear capítulo');
      setMessage('');
    },
  });

  const uploadPageMutation = useMutation({
    mutationFn: ({ chapterId, files }: { chapterId: string; files: File[] }) => {
      const form = new FormData();
      files.forEach((file) => form.append('files', file));
      return api.post(`/pages/chapter/${chapterId}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
    },
    onSuccess: () => {
      setMessage('Páginas subidas');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al subir páginas');
      setMessage('');
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: (pageId: string) => api.delete(`/pages/${pageId}`).then((r) => r.data),
    onSuccess: () => {
      setMessage('Página eliminada');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al eliminar página');
      setMessage('');
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: string) => api.delete(`/chapters/${chapterId}`).then((r) => r.data),
    onSuccess: () => {
      setMessage('Capítulo eliminado');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al eliminar capítulo');
      setMessage('');
    },
  });

  const reorderPagesMutation = useMutation({
    mutationFn: ({ chapterId, pageIds }: { chapterId: string; pageIds: string[] }) =>
      api.post(`/pages/chapter/${chapterId}/reorder`, { pageIds }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al reordenar páginas');
      setMessage('');
    },
  });

  const deleteComicMutation = useMutation({
    mutationFn: (comicId: string) => api.delete(`/comics/${comicId}`).then((r) => r.data),
    onSuccess: () => {
      setMessage('Cómic eliminado');
      queryClient.invalidateQueries({ queryKey: ['my-comic'] });
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al eliminar cómic');
      setMessage('');
    },
  });

  const [newChapterTitle, setNewChapterTitle] = useState('');

  if (!user) return <div className="mx-auto max-w-4xl px-4 py-16"><p>Inicia sesión.</p></div>;

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

  const getFullImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setCoverPreview(preview);
    const form = new FormData();
    form.append('file', file);
    api.post(`/comics/${id}/cover`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => {
        setMessage('Portada actualizada');
        setCoverPreview(getFullImageUrl(r.data.coverImage));
        queryClient.invalidateQueries({ queryKey: ['my-comic'] });
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Error al subir portada');
        setCoverPreview(null);
      });
  };

  const handlePagesChange = (chapterId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setPagePreviews((prev) => {
      const filtered = prev.filter((p) => p.chapterId !== chapterId);
      return [...filtered, { chapterId, files: fileArray, previews }];
    });
  };

  const uploadSelectedPages = async (chapterId: string) => {
    const entry = pagePreviews.find((p) => p.chapterId === chapterId);
    if (!entry) return;
    await uploadPageMutation.mutateAsync({ chapterId, files: entry.files });
    setPagePreviews((prev) => prev.filter((p) => p.chapterId !== chapterId));
  };

  const movePage = async (chapterId: string, pageId: string, direction: 'up' | 'down') => {
    const chapter = chapters?.find((c: any) => c.id === chapterId);
    if (!chapter) return;
    const pages = chapter.pages || [];
    const idx = pages.findIndex((p: any) => p.id === pageId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= pages.length) return;
    const newPageIds = pages.map((p: any) => p.id);
    [newPageIds[idx], newPageIds[newIdx]] = [newPageIds[newIdx], newPageIds[idx]];
    await reorderPagesMutation.mutateAsync({ chapterId, pageIds: newPageIds });
  };

  const movePreview = (chapterId: string, previewIndex: number, direction: 'up' | 'down') => {
    setPagePreviews((prev) => {
      const entry = prev.find((p) => p.chapterId === chapterId);
      if (!entry) return prev;
      const newIndex = direction === 'up' ? previewIndex - 1 : previewIndex + 1;
      if (newIndex < 0 || newIndex >= entry.previews.length) return prev;
      const newPreviews = [...entry.previews];
      const newFiles = [...entry.files];
      [newPreviews[previewIndex], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[previewIndex]];
      [newFiles[previewIndex], newFiles[newIndex]] = [newFiles[newIndex], newFiles[previewIndex]];
      return prev.map((p) => p.chapterId === chapterId ? { ...p, previews: newPreviews, files: newFiles } : p);
    });
  };

  const removePreview = (chapterId: string, previewIndex: number) => {
    setPagePreviews((prev) => {
      const entry = prev.find((p) => p.chapterId === chapterId);
      if (!entry) return prev;
      const newPreviews = entry.previews.filter((_, i) => i !== previewIndex);
      const newFiles = entry.files.filter((_, i) => i !== previewIndex);
      if (newPreviews.length === 0) return prev.filter((p) => p.chapterId !== chapterId);
      return prev.map((p) => p.chapterId === chapterId ? { ...p, previews: newPreviews, files: newFiles } : p);
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="title-display mb-6">Editar cómic</h1>
      {message && <div className="mb-4 rounded-md border border-master-700 bg-master-900 p-3 text-sm text-master-200">{message}</div>}
      {error && <div className="mb-4 rounded-md border border-red-700 bg-red-900 p-3 text-sm text-red-200">{error}</div>}
      <div className="card mb-8 p-6">
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Título</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Descripción</label>
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Estado</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-cosmic-300">Géneros</label>
            <select
              multiple
              size={6}
              value={selectedGenres}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map((option) => option.value);
                setSelectedGenres(values);
              }}
              className="input h-auto"
            >
              {(genresData || []).map((genre: any) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
            {selectedGenres.length > 0 && (
              <p className="mt-1 text-xs text-cosmic-400">
                Seleccionados: {(genresData || []).filter((g: any) => selectedGenres.includes(g.id)).map((g: any) => g.name).join(', ')}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => updateMutation.mutate({ title, description, status, genreIds: selectedGenres })} className="btn btn-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
            <label className="btn btn-secondary cursor-pointer">
              Subir portada
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleCoverChange} />
            </label>
            <button onClick={() => { if (confirm('¿Eliminar este cómic? Esta acción no se puede deshacer.')) { deleteComicMutation.mutate(id); } }} className="btn btn-danger" disabled={deleteComicMutation.isPending}>
              Eliminar cómic
            </button>
            {(coverPreview || comic?.coverImage) && (
              <img src={coverPreview || getFullImageUrl(comic?.coverImage)} alt="Preview portada" className="h-16 w-12 object-cover rounded border border-cosmic-700" />
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="title-display text-xl">Capítulos</h2>
        <form onSubmit={(e) => { e.preventDefault(); if (newChapterTitle.trim()) createChapterMutation.mutate(newChapterTitle); }} className="flex gap-2">
          <input className="input" placeholder="Nombre del capítulo" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} />
          <button type="submit" className="btn btn-primary" disabled={createChapterMutation.isPending}>
            {createChapterMutation.isPending ? 'Creando...' : 'Agregar'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {chapters?.map((chapter: any) => {
          const previewEntry = pagePreviews.find((p) => p.chapterId === chapter.id);
          const previewCount = previewEntry?.previews.length || 0;
          return (
          <div key={chapter.id} className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-cosmic-200">Capítulo {chapter.chapterNumber}: {chapter.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cosmic-500">{chapter.pages?.length || 0} páginas</span>
                <button onClick={() => { if (confirm('¿Eliminar capítulo?')) deleteChapterMutation.mutate(chapter.id); }} className="btn btn-danger text-xs" disabled={deleteChapterMutation.isPending}>
                  Eliminar capítulo
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {chapter.pages?.map((page: any, idx: number) => (
                <div key={page.id} className="relative aspect-[2/3] overflow-hidden rounded-md border border-cosmic-800 bg-cosmic-900">
                  <img src={getFullImageUrl(page.imageUrl)} alt={`Página ${page.pageNumber}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-1">
                    <span className="text-[10px] text-cosmic-300">#{page.pageNumber}</span>
                    <div className="flex gap-1">
                      <button onClick={() => movePage(chapter.id, page.id, 'up')} disabled={idx === 0} className="rounded bg-cosmic-800 px-1 py-0.5 text-[10px] text-cosmic-200 disabled:opacity-40">?</button>
                      <button onClick={() => movePage(chapter.id, page.id, 'down')} disabled={idx === (chapter.pages?.length || 0) - 1} className="rounded bg-cosmic-800 px-1 py-0.5 text-[10px] text-cosmic-200 disabled:opacity-40">?</button>
                      <button onClick={() => { if (confirm('¿Eliminar página?')) deletePageMutation.mutate(page.id); }} className="rounded bg-red-900 px-1 py-0.5 text-[10px] text-red-200">X</button>
                    </div>
                  </div>
                </div>
              ))}
              {previewEntry?.previews.map((src, idx) => (
                <div key={`preview-${chapter.id}-${idx}`} className="relative aspect-[2/3] overflow-hidden rounded-md border border-dashed border-master-600 bg-master-900">
                  <img src={src} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-1">
                    <span className="text-[10px] text-cosmic-300">Preview #{idx + 1}</span>
                    <div className="flex gap-1">
                      <button onClick={() => movePreview(chapter.id, idx, 'up')} disabled={idx === 0} className="rounded bg-cosmic-800 px-1 py-0.5 text-[10px] text-cosmic-200 disabled:opacity-40">?</button>
                      <button onClick={() => movePreview(chapter.id, idx, 'down')} disabled={idx === previewCount - 1} className="rounded bg-cosmic-800 px-1 py-0.5 text-[10px] text-cosmic-200 disabled:opacity-40">?</button>
                      <button onClick={() => removePreview(chapter.id, idx)} className="rounded bg-red-900 px-1 py-0.5 text-[10px] text-red-200">X</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <label className="btn btn-secondary cursor-pointer">
                Seleccionar páginas
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePagesChange(chapter.id, e.target.files)}
                />
              </label>
              {previewCount > 0 && (
                <button onClick={() => uploadSelectedPages(chapter.id)} className="btn btn-primary">
                  Subir {previewCount} páginas
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
