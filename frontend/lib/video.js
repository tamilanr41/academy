/**
 * Parse a YouTube / Vimeo / direct-file video URL into a predictable shape so
 * components can render the right player. Everything degrades gracefully: an
 * empty or unrecognised URL simply returns null (callers fall back to imagery).
 */

export function parseVideo(url) {
  if (!url || typeof url !== 'string') return null;
  const value = url.trim();
  if (!value) return null;

  const youtube = value.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (youtube) {
    const id = youtube[1];
    return {
      type: 'youtube',
      id,
      src: value,
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      background: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&rel=0&modestbranding=1&playsinline=1`,
      thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    };
  }

  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    const id = vimeo[1];
    return {
      type: 'vimeo',
      id,
      src: value,
      embed: `https://player.vimeo.com/video/${id}?autoplay=1`,
      background: `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1`,
      thumbnail: '',
    };
  }

  if (/\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i.test(value) || value.startsWith('data:video/')) {
    return { type: 'file', id: null, src: value, embed: value, background: value, thumbnail: '' };
  }

  return { type: 'iframe', id: null, src: value, embed: value, background: value, thumbnail: '' };
}

export function isEmbeddable(url) {
  const parsed = parseVideo(url);
  return Boolean(parsed && parsed.type !== 'iframe');
}
