import { Router } from 'express';
import { User } from '../models/User.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { sendError } from '../utils/errors.js';

const router = Router();
const LOCKOUT_MINUTES = 15;
const MAX_ATTEMPTS = 5;

function formatUser(user) {
  return {
    user_id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.full_name,
  };
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required', 'VALIDATION_ERROR');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return sendError(res, 401, 'Email or password incorrect', 'INVALID_CREDENTIALS');
  }

  if (user.locked_until && user.locked_until > new Date()) {
    return sendError(res, 429, 'Account locked — retry after 15 minutes', 'ACCOUNT_LOCKED');
  }

  if (!user.is_active) {
    return sendError(res, 403, 'Account has been deactivated', 'ACCOUNT_DEACTIVATED');
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    user.failed_login_attempts += 1;
    if (user.failed_login_attempts >= MAX_ATTEMPTS) {
      user.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      user.failed_login_attempts = 0;
    }
    await user.save();
    return sendError(res, 401, 'Email or password incorrect', 'INVALID_CREDENTIALS');
  }

  user.failed_login_attempts = 0;
  user.locked_until = null;
  user.last_login = new Date();
  await user.save();

  const token = signToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
  });

  res.json({ data: formatUser(user), token });
});

router.post('/logout', requireAuth, (req, res) => {
  res.clearCookie('token');
  res.status(204).send();
});

router.post('/forgot-password', async (req, res) => {
  res.json({ data: { message: 'If the email exists, a reset link has been sent' } });
});

router.post('/reset-password', async (req, res) => {
  return sendError(res, 400, 'Invalid or expired token', 'VALIDATION_ERROR');
});

export default router;
