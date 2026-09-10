import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http.js';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Ruta nije pronađena.' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: 'Neispravni podaci.',
      errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  // Duplikat u bazi (npr. e-mail koji već postoji)
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ message: 'Zapis s tim podacima već postoji.' });
  }

  console.error('[error]', err);
  const message = err instanceof Error ? err.message : 'Neočekivana greška na poslužitelju.';
  res.status(500).json({ message });
}
