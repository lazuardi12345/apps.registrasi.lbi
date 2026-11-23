import { useEffect, useState } from 'react';
import api from '../../services/api';

export function normalizeVideoUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    if (parsed.hostname.includes('youtube.com') && parsed.pathname === '/watch') {
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
  } catch {
    return url;
  }
  return url;
}

export function normalizeProgramLinks(html) {
  return html
    .replaceAll('https://lbifib.ui.ac.id/id/bipa-program', '/programs/bipa')
    .replaceAll('https://lbifib.ui.ac.id/id/language-course', '/programs/ppb')
    .replaceAll('https://lbifib.ui.ac.id/id/program-penerjemahan-dan-penjurubahasaan', '/programs/ppp');
}

export function useProgramAboutData(serviceSlug) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getServiceBySlug(serviceSlug)
      .then((response) => {
        if (mounted && response?.success) setService(response.data);
      })
      .catch((error) => console.error('Failed to load program about page:', error))
      .finally(() => mounted && setLoading(false));

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      mounted = false;
    };
  }, [serviceSlug]);

  return { service, loading };
}
