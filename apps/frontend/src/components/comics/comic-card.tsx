import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ComicsService, LikesService, FavoritesService, CommentsService } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

interface ComicCardProps {
  comic: {
    id: string;
    title: string;
    coverImage?: string;
    author?: { id?: string; username?: string; displayName?: string };
  };
}

export function ComicCard({ comic }: ComicCardProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [likesCount, setLikesCount] = useState(0);
  const [likesMe, setLikesMe] = useState(false);
  const [favStatus, setFavStatus] = useState(false);

  const { data: likesData } = useQuery({
    queryKey: ['likes', comic.id],
    queryFn: () => LikesService.count(comic.id),
  });

  const { data: likesMeData } = useQuery({
    queryKey: ['likes', 'me', comic.id],
    queryFn: () => LikesService.me(comic.id),
    enabled: isAuthenticated && !!comic.id,
  });

  const { data: favData } = useQuery({
    queryKey: ['favorites', 'isFavorite', comic.id],
    queryFn: () => FavoritesService.isFavorite(comic.id),
    enabled: isAuthenticated && !!comic.id,
  });

  useEffect(() => {
    if (typeof likesMeData?.liked === 'boolean') setLikesMe(likesMeData.liked);
  }, [likesMeData]);

  useEffect(() => {
    if (typeof favData?.isFavorite === 'boolean') setFavStatus(favData.isFavorite);
  }, [favData]);

  useEffect(() => {
    if (typeof likesData?.count === 'number') {
      setLikesCount(likesData.count);
    }
  }, [likesData]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const result = await LikesService.toggle(comic.id);
      setLikesMe(result.liked);
      setLikesCount(result.count);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', comic.id] });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: () => favStatus ? FavoritesService.remove(comic.id) : FavoritesService.add(comic.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setFavStatus((prev) => !prev);
    },
  });

  const isAuthor = isAuthenticated && user?.id === comic?.author?.id;

  return (
    <div className="group">
      <Link href={`/comics/${comic.id}`}>
        <div className="aspect-[2/3] overflow-hidden rounded-md border border-cosmic-800 bg-cosmic-900">
          <img
            src={comic.coverImage || '/placeholder.png'}
            alt={comic.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-medium text-cosmic-200">{comic.title}</p>
      </Link>
      {comic.author?.username && (
        <Link href={`/users/${comic.author.username}`} className="text-xs text-cosmic-500 hover:text-cosmic-300">
          @{comic.author.username}
        </Link>
      )}
      <div className="mt-2 flex items-center gap-2">
        {isAuthenticated && (
          <button
            onClick={(e) => { e.preventDefault(); likeMutation.mutate(); }}
            className={`text-xs ${likesMe ? 'text-master-400' : 'text-master-600'}`}
          >
            {likesMe ? '❤️' : '🤍'} {likesCount || likesData?.count || 0}
          </button>
        )}
        {isAuthenticated && (
          <button
            onClick={(e) => { e.preventDefault(); favoriteMutation.mutate(); }}
            className={`text-xs ${favStatus ? 'text-yellow-400' : 'text-yellow-600'}`}
          >
            {favStatus ? '⭐' : '☆'}
          </button>
        )}
        {isAuthor && (
          <Link href={`/user/my-comics/${comic.id}`} className="text-xs text-cosmic-400 hover:text-cosmic-300">
            Editar
          </Link>
        )}
      </div>
    </div>
  );
}
