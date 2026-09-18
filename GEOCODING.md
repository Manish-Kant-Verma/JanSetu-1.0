# Coordinate-to-address lookup

The citizen report form provides **Find address from GPS** after selecting a location. The result fills the editable area/address field and is saved as the complaint's `areaName`. Existing coordinates remain intact if the provider fails. This does not change jurisdiction routing (the current demo still uses Indore rules).

## Configure the server

Set `NOMINATIM_REVERSE_URL` to your Nominatim-compatible provider's full reverse endpoint, and optionally `GEOCODING_USER_AGENT` to identify your deployment with a contact URL/email. No new packages are needed. The server reads process environment variables; it does not automatically load a `.env` file.

For a deliberately chosen, low-volume, single-server deployment, the public endpoint is `https://nominatim.openstreetmap.org/reverse`. Before enabling it, read and accept https://operations.osmfoundation.org/policies/nominatim/ . It permits at most one request/second **across the whole application**, requires identification, attribution and caching, prohibits bulk/systematic queries, and must not receive confidential information. Use a hosted provider or self-host for larger deployments. The code serializes requests with at least 1.1 seconds between starts, limits queued lookups, deduplicates concurrent requests, and caches up to 500 results for 24 hours in memory. Multiple server replicas require a shared limiter/proxy. Cache is not persistent across restarts.

In PowerShell, after reviewing the policy, set the URL before starting the server:

```powershell
$env:NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'
npm.cmd --prefix 'c:\Users\ukave\Desktop\JanSetu\JanSetu-1.0\server' run dev
```

Without configuration the form gives a clear manual-entry fallback. Coordinates are sent only when the user presses the lookup button, not during typing or on page load. Results are approximate OpenStreetMap addresses, not proof of jurisdiction or an exact property boundary.

## Test

```powershell
Set-Location 'c:\Users\ukave\Desktop\JanSetu\JanSetu-1.0\server'
node --import tsx scripts/test-geocoding.ts
npm.cmd run build
```

The automated test uses mock provider responses and sends no real coordinates externally. For a live check, configure a provider, log in, open the citizen report form, select GPS, and click **Find address from GPS**. Verify the city/address, edit it if necessary, and confirm it is retained in the submitted complaint.
