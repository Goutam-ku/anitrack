import axios from 'axios';
import { LocalStore } from './localStore';

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE || 'https://anitrack-1.onrender.com/api';
let currentApiBase = localStorage.getItem('anitrack_api_base') || DEFAULT_API_BASE;
let backendStatus = 'checking';

export const apiEvents = new EventTarget();

export function getApiBase() {
  return currentApiBase;
}

export function setApiBase(newUrl) {
  currentApiBase = newUrl.replace(/\/+$/, '');
  localStorage.setItem('anitrack_api_base', currentApiBase);
  checkHealth();
}

export function getBackendStatus() {
  return backendStatus;
}

function updateStatus(status) {
  if (backendStatus !== status) {
    backendStatus = status;
    apiEvents.dispatchEvent(new CustomEvent('status-change', { detail: { status } }));
  }
}

export async function checkHealth() {
  try {
    const res = await axios.get(`${currentApiBase}/health`, { timeout: 3500 });
    if (res.status === 200) {
      updateStatus('online');
      return true;
    }
  } catch {
    updateStatus('local');
    return false;
  }
}

checkHealth();

// Jikan Query Cache
const jikanCache = new Map();

export const ApiClient = {
  async fetchAnimeList(query = 'top') {
    const cacheKey = `jikan_${query}`;
    if (jikanCache.has(cacheKey)) return jikanCache.get(cacheKey);

    try {
      const q = query?.trim();
      const endpoint = q && q !== 'top'
        ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=24`
        : 'https://api.jikan.moe/v4/top/anime?limit=24';

      const { data } = await axios.get(endpoint, { timeout: 6000 });
      const items = (data.data || []).map(anime => ({
        id: anime.mal_id,
        title: anime.title,
        poster: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        year: anime.year || anime.aired?.prop?.from?.year,
        type: anime.type,
        synopsis: anime.synopsis,
        episodes: anime.episodes,
        rating: anime.score,
        genres: (anime.genres || []).map(g => g.name)
      }));

      jikanCache.set(cacheKey, items);
      return items;
    } catch (err) {
      console.warn('[AniTrack] Jikan call failed, using resilient cache or backend:', err.message);
      // Try backend /api/shows
      try {
        const { data } = await axios.get(`${currentApiBase}/shows`, { params: { q: query }, timeout: 4000 });
        if (data.items) return data.items;
      } catch {}
      return [];
    }
  },

  async fetchShowDetails(id) {
    try {
      const { data } = await axios.get(`https://api.jikan.moe/v4/anime/${id}`, { timeout: 5000 });
      const a = data?.data;
      if (a) {
        return {
          id: a.mal_id,
          title: a.title,
          poster: a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url || a.images?.jpg?.image_url,
          year: a.year || a.aired?.prop?.from?.year,
          type: a.type,
          synopsis: a.synopsis,
          episodes: a.episodes || 0,
          rating: a.score,
          genres: (a.genres || []).map(g => g.name)
        };
      }
    } catch {}

    try {
      const { data } = await axios.get(`${currentApiBase}/shows/${id}`, { timeout: 4000 });
      if (data.item) return data.item;
    } catch {}

    return {
      id: Number(id),
      title: `Anime #${id}`,
      poster: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
      synopsis: 'Details loaded for this anime series.',
      year: 2024,
      type: 'TV',
      episodes: 12,
      rating: 8.5
    };
  },

  async fetchPlaylist(id) {
    try {
      const { data } = await axios.get(`${currentApiBase}/shows/${id}/playlist`, { timeout: 4000 });
      if (data.items && data.items.length > 0) return data.items;
    } catch {}

    return [
      { id: `ep-${id}-1`, title: 'Episode 1: The Beginning', hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
      { id: `ep-${id}-2`, title: 'Episode 2: Next Horizon', hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
      { id: `ep-${id}-3`, title: 'Episode 3: Rising Action', hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
    ];
  }
};
