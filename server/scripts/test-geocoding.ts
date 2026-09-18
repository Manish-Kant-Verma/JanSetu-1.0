import assert from 'node:assert/strict';
import { createGeocoder, formatAddress, parseCoordinates, GeocodingError } from '../src/geocoding';

const previous = process.env.NOMINATIM_REVERSE_URL;
try {
  assert.deepEqual(parseCoordinates('0', '0'), { lat: 0, lng: 0 });
  assert.deepEqual(parseCoordinates(-90, 180), { lat: -90, lng: 180 });
  for (const value of ['', undefined, null, true, Infinity, 'NaN', [], 91]) {
    assert.throws(() => parseCoordinates(value, 75), GeocodingError);
  }
  assert.throws(() => parseCoordinates(20, -181), GeocodingError);
  assert.equal(formatAddress({ address: { village: 'Village', state: 'State' } }).address, 'Village, State');
  assert.equal(formatAddress({ address: { town: 'Town' } }).city, 'Town');
  assert.throws(() => formatAddress({}), (error: unknown) => error instanceof GeocodingError && error.status === 404);
  delete process.env.NOMINATIM_REVERSE_URL;
  await assert.rejects(createGeocoder()(22, 75), (error: unknown) => error instanceof GeocodingError && error.status === 503);
  process.env.NOMINATIM_REVERSE_URL = 'https://provider.invalid/reverse';
  let calls = 0;
  const starts: number[] = [];
  const mock: typeof fetch = async (input) => {
    calls++; starts.push(Date.now());
    const url = new URL(String(input));
    assert.equal(url.searchParams.get('format'), 'jsonv2');
    assert(url.searchParams.has('lat') && url.searchParams.has('lon'));
    return new Response(JSON.stringify({ display_name: 'Vijay Nagar, Indore, Madhya Pradesh, India', address: { city: 'Indore', state: 'Madhya Pradesh', country: 'India', postcode: '452010' } }));
  };
  const lookup = createGeocoder(mock, 30);
  const [first, same, other] = await Promise.all([lookup(22.75, 75.89), lookup(22.75, 75.89), lookup(22.76, 75.89)]);
  assert.equal(first.city, 'Indore');
  assert.deepEqual(first, same);
  assert.deepEqual(first, other);
  assert.equal(calls, 2, 'Identical simultaneous requests must be deduplicated');
  assert(starts[1] - starts[0] >= 29, 'Requests must be spaced apart');
  await lookup(22.75, 75.89);
  assert.equal(calls, 2, 'Repeated coordinates must use the cache');
  for (const status of [429, 500]) {
    await assert.rejects(createGeocoder(async () => new Response('', { status }), 0)(22, 75), (error: unknown) => error instanceof GeocodingError && error.status === 503);
  }
  await assert.rejects(createGeocoder(async () => { throw new Error('timeout'); }, 0)(22, 75), GeocodingError);
  await assert.rejects(createGeocoder(async () => new Response('{}'), 0)(22, 75), (error: unknown) => error instanceof GeocodingError && error.status === 404);
  console.log('PASS: coordinate validation, city/address parsing, missing configuration, caching, concurrent deduplication, request spacing, provider errors, timeout and no-result fallback.');
} finally {
  if (previous === undefined) delete process.env.NOMINATIM_REVERSE_URL;
  else process.env.NOMINATIM_REVERSE_URL = previous;
}
