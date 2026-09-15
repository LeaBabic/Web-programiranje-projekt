import { Router } from 'express';
import { env } from '../config/env.js';
import { requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { HttpError } from '../utils/http.js';

const router = Router();

/** POST /api/uploads — admin učitava jednu ili više slika proizvoda. */
router.post('/', requireAdmin, upload.array('files', 10), (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new HttpError(400, 'Nije poslana nijedna datoteka.');

  res.status(201).json({
    urls: files.map((f) => `${env.SERVER_URL}/uploads/${f.filename}`),
  });
});

export default router;
