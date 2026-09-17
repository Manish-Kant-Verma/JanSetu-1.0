import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
if (fs.existsSync(dataDir)) {
  fs.rmSync(dataDir, { recursive: true, force: true });
  console.log('JanSetu data reset — the API will reseed on next start.');
} else {
  console.log('No data directory found — nothing to reset.');
}
