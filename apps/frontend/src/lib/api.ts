import axios from 'axios';

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${apiBase}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, { refreshToken: refresh });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }
      }
    }
    if (error.response?.status >= 500) {
      const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Error del servidor';
      console.error('[API 500]', msg, error.response?.data);
    }
    return Promise.reject(error);
  },
);

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

export const ComicsService = {
  findMany: (params?: any) => api.get('/comics', { params }).then((r) => r.data),
  findOne: (id: string) => api.get(`/comics/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/comics', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/comics/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/comics/${id}`).then((r) => r.data),
  popular: (limit = 10) => api.get(`/comics/popular?limit=${limit}`).then((r) => r.data),
  recent: (limit = 10) => api.get(`/comics/recent?limit=${limit}`).then((r) => r.data),
  incrementViews: (id: string) => api.post(`/comics/${id}/views`).then((r) => r.data),
  byAuthor: (authorId: string) => api.get(`/comics?authorId=${authorId}`).then((r) => r.data),
};

export const ChaptersService = {
  findMany: (comicId: string) => api.get(`/chapters/comic/${comicId}`).then((r) => r.data),
  findOne: (id: string) => api.get(`/chapters/${id}`).then((r) => r.data),
  create: (comicId: string, data: any) => api.post(`/chapters/comic/${comicId}`, data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/chapters/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/chapters/${id}`).then((r) => r.data),
};

export const PagesService = {
  findMany: (chapterId: string) => api.get(`/pages/chapter/${chapterId}`).then((r) => r.data),
  findOne: (id: string) => api.get(`/pages/${id}`).then((r) => r.data),
  create: (chapterId: string, data: any) => api.post(`/pages/chapter/${chapterId}`, data).then((r) => r.data),
  upload: (chapterId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/pages/chapter/${chapterId}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  update: (id: string, data: any) => api.patch(`/pages/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/pages/${id}`).then((r) => r.data),
};

export const GenresService = {
  findAll: () => api.get('/genres').then((r) => r.data),
  findOne: (id: string) => api.get(`/genres/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/genres', data).then((r) => r.data),
};

export const TagsService = {
  findAll: () => api.get('/tags').then((r) => r.data),
  findOne: (id: string) => api.get(`/tags/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/tags', data).then((r) => r.data),
};

export const FavoritesService = {
  list: () => api.get('/favorites').then((r) => r.data),
  isFavorite: (comicId: string) => api.get(`/favorites/comic/${comicId}`).then((r) => r.data),
  add: (comicId: string) => api.post(`/favorites/${comicId}`).then((r) => r.data),
  remove: (comicId: string) => api.delete(`/favorites/${comicId}`).then((r) => r.data),
};

export const LikesService = {
  toggle: (comicId: string) => api.post(`/likes/${comicId}`).then((r) => r.data),
  count: (comicId: string) => api.get(`/likes/comic/${comicId}`).then((r) => r.data),
  me: (comicId: string) => api.get(`/likes/comic/${comicId}/me`).then((r) => r.data),
  list: (comicId: string) => api.get(`/likes/comic/${comicId}/list`).then((r) => r.data),
};

export const CommentsService = {
  create: (comicId: string, content: string) => api.post('/comments', { comicId, content }).then((r) => r.data),
  findByComic: (comicId: string) => api.get(`/comments/comic/${comicId}`).then((r) => r.data),
  findMany: (page = 1, limit = 100) => api.get('/comments', { params: { page, limit } }).then((r) => r.data),
  remove: (id: string) => api.delete(`/comments/${id}`).then((r) => r.data),
};

export const HistoryService = {
  list: () => api.get('/history').then((r) => r.data),
  saveProgress: (data: any) => api.post(`/history/${data.comicId}/${data.chapterId}`, data).then((r) => r.data),
  getProgress: (comicId: string) => api.get(`/history/comic/${comicId}`).then((r) => r.data),
};

export const AdsService = {
  public: (placement: string) => api.get(`/ads/public/${placement}`).then((r) => r.data),
  incrementImpression: (id: string) => api.post(`/ads/${id}/impression`).then((r) => r.data),
  incrementClick: (id: string) => api.post(`/ads/${id}/click`).then((r) => r.data),
};

export const UsersService = {
  me: () => api.get('/users/me').then((r) => r.data),
  findById: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  findByUsername: (username: string) => api.get(`/users/username/${username}`).then((r) => r.data),
  updateProfile: (data: any) => api.patch('/users/me', data).then((r) => r.data),
  list: (params?: any) => api.get('/users', { params }).then((r) => r.data),
  suspend: (id: string) => api.post(`/users/${id}/suspend`).then((r) => r.data),
  reactivate: (id: string) => api.post(`/users/${id}/reactivate`).then((r) => r.data),
  remove: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
  isUsernameTaken: (username: string) => api.get(`/auth/check-username?username=${encodeURIComponent(username)}`).then((r) => r.data),
};

export const AdminService = {
  deleteComic: (id: string) => api.delete(`/admin/comics/${id}`).then((r) => r.data),
  deleteComment: (id: string) => api.delete(`/admin/comments/${id}`).then((r) => r.data),
};

export const ModerationService = {
  pending: (params?: any) => api.get('/moderation/pending', { params }).then((r) => r.data),
  approve: (id: string) => api.post(`/moderation/comic/${id}/approve`).then((r) => r.data),
  reject: (id: string, reason: string) => api.post(`/moderation/comic/${id}/reject`, { reason }).then((r) => r.data),
  hide: (id: string, reason?: string) => api.post(`/moderation/comic/${id}/hide`, { reason }).then((r) => r.data),
  dashboard: () => api.get('/moderation/dashboard').then((r) => r.data),
};

export const ReportsService = {
  create: (data: any) => api.post('/reports', data).then((r) => r.data),
  findMany: (params?: any) => api.get('/reports', { params }).then((r) => r.data),
  resolve: (id: string) => api.post(`/reports/${id}/resolve`).then((r) => r.data),
  reject: (id: string) => api.post(`/reports/${id}/reject`).then((r) => r.data),
};
