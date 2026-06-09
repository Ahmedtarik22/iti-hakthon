import { Router } from 'express';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

const router = Router();

const LOCALES = [
  { code: 'en', label: 'English', direction: 'ltr' },
  { code: 'ar', label: 'عربي', direction: 'rtl' },
];

router.get('/', (req, res) => {
  res.json({ data: LOCALES });
});

router.put('/', authenticate, requireAuth, async (req, res, next) => {
  try {
    const { locale } = req.body;
    if (!LOCALES.some((l) => l.code === locale)) {
      throw new AppError('Unsupported locale', 400, 'VALIDATION_ERROR');
    }
    req.user.locale = locale;
    await req.user.save();
    res.json({ data: { locale } });
  } catch (err) {
    next(err);
  }
});

export default router;
