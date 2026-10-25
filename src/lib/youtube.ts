/** Accept shared or embedded YouTube links without retaining tracking parameters. */
export function getYouTubeVideo(url?: string) {
  if (!url?.trim()) return null;

  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return null;

    const host = parsed.hostname.replace(/^www\./, '');
    const segments = parsed.pathname.split('/').filter(Boolean);
    let id: string | null = null;

    if (host === 'youtu.be' && segments.length === 1) {
      id = segments[0];
    } else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
      if (parsed.pathname === '/watch') {
        id = parsed.searchParams.get('v');
      } else if (['embed', 'shorts', 'live'].includes(segments[0]) && segments.length === 2) {
        id = segments[1];
      }
    }

    if (!id || !/^[\w-]{11}$/.test(id)) return null;

    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&cc_load_policy=1&cc_lang_pref=es&hl=es&rel=0`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
    };
  } catch {
    return null;
  }
}
