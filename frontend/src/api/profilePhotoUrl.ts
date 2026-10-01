/** Route old stored photo paths through Django's production API proxy. */
export function profilePhotoUrl(value: string): string {
  try {
    const url = new URL(value, window.location.origin);
    if (!url.pathname.startsWith('/media/profile-photos/')) return value;

    url.pathname = `/api${url.pathname}`;
    return /^https?:\/\//i.test(value)
      ? url.toString()
      : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value
  }
