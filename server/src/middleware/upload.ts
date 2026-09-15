import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { HttpError } from '../utils/http.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

// Datoteka se drži u memoriji dok se ne odluči ide li na Cloudinary ili na disk.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(new HttpError(415, 'Dozvoljene su samo slike (JPEG, PNG, WEBP, AVIF, GIF).'));
    }
    cb(null, true);
  },
});

/** Sprema sliku u `server/uploads/` i vraća naziv datoteke. Koristi se bez Cloudinaryja. */
export async function saveToDisk(buffer: Buffer, originalName: string) {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return filename;
}
