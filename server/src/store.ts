import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { DB } from './types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.JANSETU_DATA_DIR
  ? path.resolve(process.env.JANSETU_DATA_DIR)
  : path.join(__dirname, '..', 'data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let db: DB | null = null;

export function loadDB(seedFn: () => DB): DB {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as DB;
      return db;
    } catch {
      // corrupted file → reseed
    }
  }
  db = seedFn();
  saveDB();
  return db;
}

export function getDB(): DB {
  if (!db) throw new Error('DB not initialised');
  return db;
}

export function saveDB() {
  if (!db) return;
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export function nextComplaintId(): string {
  const d = getDB();
  d.counters.complaint += 1;
  return `JS-2026-${String(d.counters.complaint).padStart(6, '0')}`;
}
