import { Router } from 'express';
import { cloudinaryEnabled, env } from '../config/env.js';
import { requireAdmin } from '../middleware/auth.js';
import { saveToDisk, upload } from '../middleware/upload.js';
import { uploadImage } from '../services/cloudinary.js';
import { asyncHandler, HttpError } from '../utils/http.js';

const router = Router();

/**
 * POST /api/uploads — admin učitava jednu ili više slika proizvoda.
 * Sa Cloudinary podacima slike idu u oblak (preživljavaju ponovni deploy),
 * inače se spremaju na lokalni disk poslužitelja.
 */
router.post(
  '/',
  requireAdmin,
  upload.array('files', 10),
  asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) throw new HttpError(400, 'Nije poslana nijedna datoteka.');

    if (!cloudinaryEnabled) {
      const urls = await Promise.all(
        files.map(async (f) => `${env.SERVER_URL}/uploads/${await saveToDisk(f.buffer, f.originalname)}`),
      );
      return res.status(201).json({ urls });
    }

    try {
      const urls = await Promise.all(files.map((f) => uploadImage(f.buffer)));
      res.status(201).json({ urls });
    } catch (err) {
      console.error('[cloudinary] učitavanje nije uspjelo:', err);
      throw new HttpError(502, 'Slika nije spremljena — usluga za slike trenutačno nije dostupna.');
    }
  }),
);

export default router;
