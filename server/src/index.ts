import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDB, UPLOAD_DIR } from './store';
import { buildSeed } from './seed';
import { sweepOverdue } from './lib';
import authRoutes from './routes/auth';
import complaintRoutes from './routes/complaints';
import assignmentRoutes from './routes/assignments';
import govRoutes from './routes/gov';
import projectRoutes from './routes/projects';
import adminRoutes from './routes/admin';
import miscRoutes from './routes/misc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// The built React app is served by this same server so that the client's relative
// /api and /uploads URLs work in production without CORS or a dev proxy.
const CLIENT_DIST = process.env.JANSETU_CLIENT_DIST
  ? path.resolve(process.env.JANSETU_CLIENT_DIST)
  : path.join(__dirname, '..', '..', 'client', 'dist');
const CLIENT_INDEX = path.join(CLIENT_DIST, 'index.html');
const SERVE_CLIENT = fs.existsSync(CLIENT_INDEX);

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('[JanSetu] JWT_SECRET is not set — falling back to the built-in demo secret. Set JWT_SECRET before exposing this deployment publicly.');
}

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// uploaded evidence files
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1d' }));

// load (or seed) the database
loadDB(buildSeed);
sweepOverdue();

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/gov', govRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', miscRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'JanSetu API', time: new Date().toISOString() }));

// unknown API paths answer with JSON, never with the client HTML
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// production mode: serve the built client and let react-router resolve deep links
if (SERVE_CLIENT) {
  app.use(express.static(CLIENT_DIST, { maxAge: '1h', index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(CLIENT_INDEX);
  });
} else {
  console.warn('[JanSetu] No client build found — run "npm run build --prefix client" (or "npm run deploy:prepare") to serve the web app from this server.');
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[JanSetu API error]', err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('');
  console.log(`  🌉 JanSetu API running → http://localhost:${PORT}`);
  console.log(`     evidence store → ${UPLOAD_DIR}`);
  if (SERVE_CLIENT) console.log(`     web app        → ${CLIENT_DIST}`);
  console.log('');
});