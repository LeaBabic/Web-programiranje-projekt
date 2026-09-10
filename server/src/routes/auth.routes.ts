import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, signToken, type AuthRequest } from '../middleware/auth.js';
import { publicUser, User, type UserDoc } from '../models/User.js';
import { asyncHandler, HttpError } from '../utils/http.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ime mora imati barem 2 znaka.'),
  email: z.string().trim().email('Neispravna e-mail adresa.'),
  password: z.string().min(6, 'Lozinka mora imati barem 6 znakova.'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Neispravna e-mail adresa.'),
  password: z.string().min(1, 'Unesite lozinku.'),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().max(40).optional(),
  address: z
    .object({
      street: z.string().trim().max(120).optional(),
      city: z.string().trim().max(80).optional(),
      postalCode: z.string().trim().max(20).optional(),
      country: z.string().trim().max(80).optional(),
    })
    .optional(),
});

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body);

    const exists = await User.findOne({ email: email.toLowerCase() }).lean();
    if (exists) throw new HttpError(409, 'Korisnik s tom e-mail adresom već postoji.');

    const user = (await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
    })) as UserDoc;

    res.status(201).json({ token: signToken(String(user._id)), user: publicUser(user) });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = (await User.findOne({ email: email.toLowerCase() })) as UserDoc | null;
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, 'Neispravna e-mail adresa ili lozinka.');
    }

    res.json({ token: signToken(String(user._id)), user: publicUser(user) });
  }),
);

/** Prijava u admin panel — odbija korisnike bez admin uloge. */
router.post(
  '/admin/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = (await User.findOne({ email: email.toLowerCase() })) as UserDoc | null;
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, 'Neispravna e-mail adresa ili lozinka.');
    }
    if (user.role !== 'admin') throw new HttpError(403, 'Ovaj račun nema administratorske ovlasti.');

    res.json({ token: signToken(String(user._id)), user: publicUser(user) });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    res.json({ user: publicUser(req.user!) });
  }),
);

router.put(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const data = profileSchema.parse(req.body);
    const user = req.user!;

    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.address) {
      const current = user.address ?? { street: '', city: '', postalCode: '', country: 'Hrvatska' };
      user.address = {
        street: data.address.street ?? current.street,
        city: data.address.city ?? current.city,
        postalCode: data.address.postalCode ?? current.postalCode,
        country: data.address.country ?? current.country,
      };
    }

    await user.save();
    res.json({ user: publicUser(user) });
  }),
);

export default router;
