import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, type UserDoc } from '../models/User.js';
import { HttpError } from '../utils/http.js';

export interface AuthRequest extends Request {
  user?: UserDoc;
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

async function resolveUser(req: Request): Promise<UserDoc | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as jwt.JwtPayload;
    if (!payload.sub) return null;
    return (await User.findById(payload.sub)) as UserDoc | null;
  } catch {
    return null;
  }
}

/** Zahtijeva prijavljenog korisnika. */
export async function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const user = await resolveUser(req);
  if (!user) return next(new HttpError(401, 'Potrebna je prijava.'));
  req.user = user;
  next();
}

/** Ne zahtijeva prijavu, ali postavlja req.user ako je token poslan. */
export async function attachUser(req: AuthRequest, _res: Response, next: NextFunction) {
  const user = await resolveUser(req);
  if (user) req.user = user;
  next();
}

/** Zahtijeva prijavljenog korisnika s admin ulogom. */
export async function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  const user = await resolveUser(req);
  if (!user) return next(new HttpError(401, 'Potrebna je prijava.'));
  if (user.role !== 'admin') return next(new HttpError(403, 'Nemate administratorske ovlasti.'));
  req.user = user;
  next();
}
