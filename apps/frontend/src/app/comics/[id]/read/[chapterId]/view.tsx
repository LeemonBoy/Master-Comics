'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PagesService, HistoryService, AdsService, ComicsService } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ReaderView({ comicId, chapterId }: { comicId: string; chapterId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [pages, setPages] = useState<{ id: string; imageUrl: string; pageNumber: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [mode, setMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [showControls, setShowControls] = useState(true);
  const [ad, setAd] = useState<any>(null);
  const [showAd, setShowAd] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewedComicsRef = useRef<Set<string>>(new Set());
  const panState = useRef({ panning: false, startX: 0, startY: 0, translateX: 0, translateY: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMiniControls, setShowMiniControls] = useState(false);
  const miniControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [protectionMessage, setProtectionMessage] = useState('');

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const prevent = (e: Event) => {
      if (e.target instanceof Element && e.target.closest('#reader-root')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', prevent as EventListener);
    document.addEventListener('dragstart', prevent as EventListener);
    document.addEventListener('selectstart', prevent as EventListener);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        setProtectionMessage('Acción bloqueada');
        setTimeout(() => setProtectionMessage(''), 2000);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', prevent as EventListener);
      document.removeEventListener('dragstart', prevent as EventListener);
      document.removeEventListener('selectstart', prevent as EventListener);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';

  const getFullImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  };

  useEffect(() => {
    if (!chapterId) return;
    setError('');
    PagesService.findMany(chapterId)
      .then((res) => {
        const items = Array.isArray(res) ? res : (res?.data || []);
        setPages(items);
        setStartTime(Date.now());
      })
      .catch(() => {
        setError('No se pudieron cargar las páginas de este capítulo.');
        setPages([]);
      });
  }, [chapterId]);

  useEffect(() => {
    if (!comicId) return;
    const visitedKey = `visited-comic-${comicId}`;
    const alreadyVisited = sessionStorage.getItem(visitedKey);
    if (!alreadyVisited) {
      ComicsService.incrementViews(comicId)
        .then(() => sessionStorage.setItem(visitedKey, '1'))
        .catch((err) => console.error('Error incrementando vistas:', err));
    }
  }, [comicId]);

  const scrollToPage = useCallback((index: number) => {
    const container = containerRef.current;
    const pageEl = document.getElementById(`reader-page-${index}`);
    if (!container || !pageEl) return;
    const containerRect = container.getBoundingClientRect();
    const pageRect = pageEl.getBoundingClientRect();
    const offset = pageRect.top - containerRect.top + container.scrollTop;
    container.scrollTo({ top: offset, behavior: 'smooth' });
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setZoom(1);
      panState.current = { panning: false, startX: 0, startY: 0, translateX: 0, translateY: 0 };
      if (mode === 'vertical') scrollToPage(next);
    }
  }, [currentPage, pages.length, mode, scrollToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      setZoom(1);
      panState.current = { panning: false, startX: 0, startY: 0, translateX: 0, translateY: 0 };
      if (mode === 'vertical') scrollToPage(prev);
    }
  }, [currentPage, mode, scrollToPage]);

  const goToPage = useCallback((index: number) => {
    setCurrentPage(index);
    setZoom(1);
    panState.current = { panning: false, startX: 0, startY: 0, translateX: 0, translateY: 0 };
    if (mode === 'vertical') scrollToPage(index);
  }, [mode, scrollToPage]);

  const resetView = useCallback(() => {
    setCurrentPage(0);
    setZoom(1);
    panState.current = { panning: false, startX: 0, startY: 0, translateX: 0, translateY: 0 };
    if (mode === 'vertical') scrollToPage(0);
  }, [mode, scrollToPage]);

  useEffect(() => {
    if (mode !== 'vertical') return;
    scrollToPage(currentPage);
  }, [mode, currentPage, scrollToPage]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mode === 'vertical' && !document.fullscreenElement) {
        e.preventDefault();
        if (e.deltaY > 0) nextPage();
        else prevPage();
      }
    };
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });
    return () => { if (container) container.removeEventListener('wheel', handleWheel); };
  }, [mode, nextPage, prevPage]);

  const saveProgress = useCallback(async (pageNumber: number) => {
    await HistoryService.saveProgress({
      comicId: comicId,
      chapterId: chapterId,
      lastPageNumber: pageNumber + 1,
      totalPages: pages.length,
    });
  }, [comicId, chapterId, pages.length]);

  useEffect(() => { saveProgress(currentPage); }, [currentPage, saveProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 60000;
      if (elapsed >= 5) { loadAd(); setStartTime(Date.now()); }
    }, 30000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => { if (currentPage > 0 && currentPage % 5 === 0) loadAd(); }, [currentPage]);

  const loadAd = async () => {
    try {
      const res = await AdsService.public('READER');
      setAd(res.data);
      setShowAd(true);
      AdsService.incrementImpression(res.data.id).catch(() => {});
    } catch { setShowAd(false); }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await containerRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    panState.current = { panning: true, startX: e.clientX - panState.current.translateX, startY: e.clientY - panState.current.translateY, translateX: panState.current.translateX, translateY: panState.current.translateY };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!panState.current.panning) return;
    panState.current.translateX = e.clientX - panState.current.startX;
    panState.current.translateY = e.clientY - panState.current.startY;
    const transform = `scale(${zoom}) translate(${panState.current.translateX / zoom}px, ${panState.current.translateY / zoom}px)`;
    const target = e.currentTarget as HTMLDivElement;
    const image = target.querySelector('img');
    if (image) image.style.transform = transform;
  }, [zoom]);

  const handleMouseUp = useCallback(() => { panState.current.panning = false; }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1) {
      const touch = e.touches[0];
      panState.current = { panning: true, startX: touch.clientX - panState.current.translateX, startY: touch.clientY - panState.current.translateY, translateX: panState.current.translateX, translateY: panState.current.translateY };
    } else {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (zoom > 1 && panState.current.panning && e.touches.length === 1) {
      const touch = e.touches[0];
      panState.current.translateX = touch.clientX - panState.current.startX;
      panState.current.translateY = touch.clientY - panState.current.startY;
      const transform = `scale(${zoom}) translate(${panState.current.translateX / zoom}px, ${panState.current.translateY / zoom}px)`;
      const target = e.currentTarget as HTMLDivElement;
      const image = target.querySelector('img');
      if (image) image.style.transform = transform;
    }
  }, [zoom]);

  const handleTouchEnd = (e: React.TouchEvent) => {
    panState.current.panning = false;
    if (zoom > 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) nextPage(); else prevPage(); }
  };

  return (
    <div id="reader-root" ref={containerRef} className={`mx-auto ${mode === 'vertical' ? 'max-w-3xl h-screen overflow-y-auto' : 'max-w-5xl'} px-4 py-6 ${showControls ? 'pt-20' : ''} ${isFullscreen ? 'fixed inset-0 max-w-none overflow-y-auto bg-cosmic-950' : ''}`}>
      {showControls && (
        <div className="fixed inset-x-0 top-16 z-50 flex justify-center">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto bg-cosmic-950/80 p-2 rounded-md">
            <button onClick={prevPage} disabled={currentPage === 0} className="btn btn-secondary whitespace-nowrap">Anterior</button>
            <span className="text-sm text-cosmic-400 whitespace-nowrap">{currentPage + 1} / {pages.length}</span>
            <button onClick={nextPage} disabled={currentPage === pages.length - 1} className="btn btn-secondary whitespace-nowrap">Siguiente</button>
            <button onClick={() => setMode(mode === 'vertical' ? 'horizontal' : 'vertical')} className="btn btn-secondary whitespace-nowrap">{mode === 'vertical' ? 'Horizontal' : 'Vertical'}</button>
            <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="btn btn-secondary whitespace-nowrap">Zoom +</button>
            <button onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} className="btn btn-secondary whitespace-nowrap">Zoom -</button>
            <button onClick={resetView} className="btn btn-secondary whitespace-nowrap">Reset</button>
            <button onClick={toggleFullscreen} className="btn btn-secondary whitespace-nowrap">?</button>
            <button onClick={() => setShowControls(false)} className="btn btn-secondary whitespace-nowrap">Ocultar</button>
          </div>
        </div>
      )}

      {!showControls && (
        <div
          className="fixed bottom-4 right-4 z-50"
          onMouseEnter={() => {
            setShowMiniControls(true);
            if (miniControlsTimerRef.current) clearTimeout(miniControlsTimerRef.current);
          }}
          onMouseLeave={() => {
            miniControlsTimerRef.current = setTimeout(() => setShowMiniControls(false), 1200);
          }}
        >
          <button onClick={() => setShowControls(true)} className="btn btn-primary">Controles</button>
          {showMiniControls && (
            <div className="absolute bottom-12 right-0 flex gap-2 bg-cosmic-900/95 border border-cosmic-700 p-2 rounded-md shadow-lg backdrop-blur">
              <button onClick={() => { if (currentPage > 0) prevPage(); }} className="btn btn-secondary text-xs">?</button>
              <button onClick={() => { if (currentPage < pages.length - 1) nextPage(); }} className="btn btn-secondary text-xs">?</button>
              <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="btn btn-secondary text-xs">+</button>
              <button onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} className="btn btn-secondary text-xs">-</button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {protectionMessage && <p className="text-sm text-cosmic-400">{protectionMessage}</p>}

      {mode === 'vertical' ? (
        <div>
          {pages.map((page, idx) => (
            <div
              key={page.id}
              id={`reader-page-${idx}`}
              className="overflow-hidden bg-cosmic-900"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={getFullImageUrl(page.imageUrl)}
                alt={`Página ${idx + 1}`}
                className="w-full object-contain select-none"
                style={{ transform: `scale(${zoom})`, cursor: zoom > 1 ? 'grab' : 'default' }}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="relative overflow-auto bg-cosmic-900"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {pages[currentPage] && (
            <img
              src={getFullImageUrl(pages[currentPage].imageUrl)}
              alt={`Página ${currentPage + 1}`}
              className="w-full object-contain select-none"
              style={{ transform: `scale(${zoom})`, cursor: zoom > 1 ? 'grab' : 'default' }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
          <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={prevPage} />
          <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={nextPage} />
        </div>
      )}

      {showControls && pages.length > 0 && (
        <div className="mt-4">
          <input type="range" min={0} max={pages.length - 1} value={currentPage} onChange={(e) => goToPage(parseInt(e.target.value))} className="w-full" />
        </div>
      )}

      {showAd && ad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cosmic-950/90">
          <div className="card max-w-lg p-6 text-center">
            <img src={ad.imageUrl} alt={ad.name} className="mx-auto mb-4 max-h-64 rounded-md" />
            <p className="mb-4 text-sm text-cosmic-300">{ad.name}</p>
            <button onClick={() => setShowAd(false)} className="btn btn-primary">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
