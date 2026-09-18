# 🚀 Deploying JanSetu

JanSetu ships as **one Node service**: the Express API (`server/`) also serves the built React app (`client/dist`). That keeps the client's relative `/api` and `/uploads` URLs working in production — no CORS setup, no proxy and no second host required.

The only stateful parts are the JSON database (`db.json`) and the uploaded evidence files, which live together in one data folder. Point that folder at a persistent disk (or volume) and the deployment keeps its data across restarts.

---

## 1. How the production build works

| Script | What it does |
| --- | --- |
| `npm run deploy:prepare` | Installs `server` and `client` dependencies (including dev deps) and builds the React app into `client/dist`. Use this as the platform **build command**. |
| `npm start` | Runs `npm start --prefix server`, i.e. `tsx src/index.ts`. Use this as the platform **start command**. |
| `npm run build` | Client build only (used by CI if you split the steps). |
| `npm run reset-db` | Deletes the data folder so the next boot re-seeds the demo database. |

At startup the server:

1. creates/uses `JANSETU_DATA_DIR` (default `server/data`),
2. loads `db.json`, or seeds a full demo dataset (users, orgs, complaints, projects, assignments, sample evidence SVGs) when the file is missing,
3. serves `/api/*` and `/uploads/*`,
4. serves `client/dist` and returns `index.html` for unknown non-API paths, so React Router deep links such as `/login`, `/citizen/report` or `/gov/map` work on refresh,
5. answers `/api/health` (used as the platform health check).

When there is no `client/dist` folder (the plain `npm run dev` workflow) the server skips step 4 and only runs the API.

---

## 2. Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | no | `4000` | HTTP port. Render/Railway/Fly inject this automatically. |
| `NODE_ENV` | recommended | `development` | Set to `production`; the server then warns when `JWT_SECRET` is missing. |
| `JWT_SECRET` | **yes** for a public deployment | built-in demo secret | Signs login tokens. Without it, anyone can forge an admin token. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. |
| `JANSETU_DATA_DIR` | recommended | `server/data` | Folder holding `db.json` + `uploads/`. Point it at your persistent disk, e.g. `/var/data`. |
| `JANSETU_CLIENT_DIST` | no | `client/dist` | Folder with the built client, if you keep it somewhere else. |
| `GEOCODING_USER_AGENT` | no | `JanSetu/1.0 (...)` | Identifies your deployment to the reverse-geocoding provider. |
| `NOMINATIM_REVERSE_URL` | no | unset | Enables the **Find address from GPS** button. Read `GEOCODING.md` first — the public OSM endpoint has a strict usage policy. Without it the form falls back to manual address entry. |

---

## 3. Option A — Render (recommended, blueprint included)

`render.yaml` in this folder describes the whole service.

1. **Push the project to GitHub** (the repository is already configured as `Manish-Kant-Verma/JanSetu-1.0`):

   ```powershell
   Set-Location 'c:\Users\ukave\Desktop\JanSetu\JanSetu-1.0'
   git add .
   git commit -m "Deploy JanSetu (build scripts, Docker, Render blueprint)"
   git push origin main
   ```

   `git add .` keeps `server/data/` out of the repository because of `.gitignore`; see section 7 if you want your current demo data included.

2. In Render: **New + → Blueprint**, select the repository and apply it. (Alternatively **New + → Web Service** and type the build/start commands from section 1 manually.)

3. Check the settings Render picked up:
   * Build command: `npm run deploy:prepare`
   * Start command: `npm start`
   * Health check path: `/api/health`
   * Env vars: `NODE_VERSION=22`, `JWT_SECRET` (auto-generated), `JANSETU_DATA_DIR=/var/data`, `GEOCODING_USER_AGENT`

4. **Disk**: the blueprint mounts a 1 GB disk at `/var/data`. Disks require a paid instance type. On the **free** instance type, delete both the `disk:` block and the `JANSETU_DATA_DIR` variable — the site still deploys, but the database and uploaded photos restart from the demo seed after every deploy or restart.

5. Deploy, then open `https://<your-service>.onrender.com`.

---

## 4. Option B — Railway

1. **New Project → Deploy from GitHub repo**, pick the repository.
2. Build command: `npm run deploy:prepare`. Start command: `npm start`.
3. Variables: `JWT_SECRET` (long random string), `JANSETU_DATA_DIR=/data`, optionally `GEOCODING_USER_AGENT`.
4. Add a **Volume** mounted at `/data`.
5. Generate a public domain under **Settings → Networking**.

---

## 5. Option C — Docker (VPS, Fly.io, any container host)

The `Dockerfile` builds the client in a first stage and runs a slim production image:

```powershell
Set-Location 'c:\Users\ukave\Desktop\JanSetu\JanSetu-1.0'
docker build -t jansetu .
docker run -d --name jansetu -p 4000:4000 -v jansetu-data:/data -e JWT_SECRET=replace-with-a-long-random-value jansetu
```

Then open `http://localhost:4000`. On a VPS, put Caddy or nginx in front of port 4000 for HTTPS:

```text
your-domain.example {
    reverse_proxy 127.0.0.1:4000
}
```

The container already sets `JANSETU_DATA_DIR=/data` and declares `/data` as a volume, so `docker run ... -v jansetu-data:/data` (or a host folder) is all the persistence you need.

---

## 6. Option D — static host + separate API (not recommended here)

Netlify/Vercel/GitHub Pages can host `client/dist`, but the client calls `/api` and `/uploads` relative to its own origin, so you would have to:

* add an API base URL (for example `VITE_API_BASE`) and use it in `client/src/api.ts` **and** in every place that renders an image path returned by the API, and
* allow that origin in the server's `cors()`.

Use this only if you need a CDN in front of the UI; the single-service setup above is simpler and already production-shaped.

---

## 7. Shipping your current demo data

`server/data/` is gitignored, so a fresh deployment seeds itself with the built-in demo dataset (8 complaints, 2 projects, users for every role) at first boot — the seed dates are relative to the boot date, so the demo always looks current.

If you want the **exact** records that are on your machine right now (including the uploaded JPEG evidence):

```powershell
Set-Location 'c:\Users\ukave\Desktop\JanSetu\JanSetu-1.0'
git add -f server/data
git commit -m "Include current demo database and uploads"
git push origin main
```

Then either point `JANSETU_DATA_DIR` at the checked-in folder, or copy its contents into the mounted disk once after the first deploy. For Docker, also delete the `server/data` line from `.dockerignore` so the folder is baked into the image.

---

## 8. Demo logins (from `server/src/seed.ts`)

| Role | Email | Password |
| --- | --- | --- |
| JanSetu Admin | `admin@jansetu.in` | `Admin@123` |
| Citizen | `citizen@jansetu.in` | `Citizen@123` |
| Citizen (second) | `citizen2@jansetu.in` | `Citizen@123` |
| JS Member (student volunteer) | `member@jansetu.in` | `Member@123` |
| Government official | `officer@jansetu.in` | `Gov@123` |
| Contractor | `contractor@buildwell.in` | `Build@123` |

⚠️ These passwords live in a public repository, and the seed data is recreated on a fresh disk. The login page also loads them from the public `GET /api/auth/demo-accounts` endpoint (`server/src/routes/auth.ts`), so every visitor to a deployed copy sees them. Change them (or remove the demo users) before a real public launch, and always set a strong `JWT_SECRET`.

---

## 9. Smoke test after deploying

```powershell
Invoke-RestMethod https://your-host.example/api/health
(Invoke-WebRequest https://your-host.example/ -UseBasicParsing).StatusCode
(Invoke-WebRequest https://your-host.example/login -UseBasicParsing).StatusCode
```

Expected: an object with `ok = True` and `service = 'JanSetu API'`, then `200` for both pages — the second one proves the SPA fallback works on a deep link. Finally log in as the citizen, submit a test report with a photo, and confirm the image loads from `/uploads/...`.

Run the same checks locally in production mode before pushing:

```powershell
Set-Location 'c:\Users\ukave\Desktop\JanSetu\JanSetu-1.0'
$env:NODE_ENV = 'production'
$env:JWT_SECRET = 'local-test-secret'
npm run deploy:prepare
npm start
```

Open `http://localhost:4000` — the API, the web app and `/uploads` are all served by that one process.

---

## 10. Operational notes and current limitations

* **One instance only.** The database is a single JSON file rewritten in place and uploads are local files, so do not scale the service horizontally. Keep one replica with one disk.
* **Backups** = copy `db.json` and `uploads/` off the disk. There is no migration system: schema changes require editing `db.json`, or `npm run reset-db` to rebuild the demo dataset.
* **Evidence storage** is the local disk, not object storage. If the disk is removed the photos are gone; only the demo SVG placeholders are regenerated by the seed.
* **`JWT_SECRET` must stay stable.** Rotating it logs everybody out; tokens are otherwise stateless, so ordinary restarts are safe.
* **CORS is open** (`app.use(cors())` in `server/src/index.ts`). Harmless for the same-origin setup here, but restrict the allowed origins if you ever expose the API on a separate domain.
* **Logs** go to stdout, so every platform's log viewer shows the API and startup messages.
* **HTTPS** is provided by the platform (Render/Railway/Fly) or by your reverse proxy — never expose port 4000 directly to the internet.
* **Tests** still work as before: `node --import tsx server/scripts/regression.mjs`, `server/scripts/test-approval.ts`, `server/scripts/test-initial-approval.ts` and `server/scripts/test-geocoding.ts` use temporary data folders and never touch the deployment data.