export interface GeoAddress {
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export class GeocodingError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function parseCoordinates(lat: unknown, lng: unknown) {
  const parse = (value: unknown) => {
    if (typeof value !== 'number' && typeof value !== 'string') return NaN;
    if (typeof value === 'string' && !value.trim()) return NaN;
    return Number(value);
  };
  const latitude = parse(lat), longitude = parse(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new GeocodingError(400, 'Enter valid latitude (-90 to 90) and longitude (-180 to 180).');
  }
  return { lat: latitude, lng: longitude };
}

export function formatAddress(data: unknown): GeoAddress {
  const source = data && typeof data === 'object' ? data as Record<string, unknown> : {};
  const fields = source.address && typeof source.address === 'object' ? source.address as Record<string, unknown> : {};
  const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
  const city = text(fields.city) || text(fields.town) || text(fields.village) || text(fields.municipality) || text(fields.hamlet);
  const state = text(fields.state), postcode = text(fields.postcode), country = text(fields.country);
  const address = text(source.display_name) || [...new Set([text(fields.road), text(fields.suburb), city, state, postcode, country].filter(Boolean))].join(', ');
  if (!address || source.error) throw new GeocodingError(404, 'No address found here. Enter the area or landmark manually.');
  return { address, city, state, postcode, country };
}

// Single-process limiter; deployments with multiple replicas need a shared proxy/limiter.
export function createGeocoder(fetcher: typeof fetch = fetch, intervalMs = 1100) {
  const cache = new Map<string, { value: GeoAddress; expires: number }>();
  const pending = new Map<string, Promise<GeoAddress>>();
  let queue: Promise<unknown> = Promise.resolve();
  let lastStarted = 0;
  return async (latitude: unknown, longitude: unknown): Promise<GeoAddress> => {
    const { lat, lng } = parseCoordinates(latitude, longitude);
    const endpoint = process.env.NOMINATIM_REVERSE_URL;
    if (!endpoint) throw new GeocodingError(503, 'Address lookup is not configured. Enter the area or landmark manually.');
    const url = new URL(endpoint);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('zoom', '18');
    const key = url.toString();
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value;
    if (pending.has(key)) return pending.get(key)!;
    if (pending.size >= 5) throw new GeocodingError(429, 'Address lookup is busy. Please try again shortly.');
    const task = queue.then(async () => {
      const wait = intervalMs - (Date.now() - lastStarted);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      lastStarted = Date.now();
      try {
        const response = await fetcher(url, {
          headers: { 'User-Agent': process.env.GEOCODING_USER_AGENT || 'JanSetu/1.0 (civic complaint address lookup)', 'Accept-Language': 'en' },
          signal: AbortSignal.timeout(6000),
        });
        if (response.status === 404) throw new GeocodingError(404, 'No address found here. Enter the area or landmark manually.');
        if (!response.ok) throw new GeocodingError(503, 'Address provider is unavailable. Try again or enter the address manually.');
        const value = formatAddress(await response.json());
        if (cache.size >= 500) cache.delete(cache.keys().next().value!);
        cache.set(key, { value, expires: Date.now() + 86400000 });
        return value;
      } catch (error) {
        if (error instanceof GeocodingError) throw error;
        throw new GeocodingError(503, 'Address lookup failed or timed out. Enter the area or landmark manually.');
      }
    });
    pending.set(key, task);
    queue = task.catch(() => undefined);
    try { return await task; } finally { pending.delete(key); }
  };
}

export const reverseGeocode = createGeocoder();
