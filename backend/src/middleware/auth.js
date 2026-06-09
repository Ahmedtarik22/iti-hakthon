import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function signToken(user) {
  return jwt.sign(
    { user_id: user._id.toString(), role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : cookieToken;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.user_id);
    if (!user || !user.is_active) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  } catch {
    req.user = null;
    next();
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return sendError(res, 401, 'Authentication required', 'UNAUTHORIZED');
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required', 'UNAUTHORIZED');
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Insufficient role for this action', 'FORBIDDEN');
    }
    next();
  };
}

export function optionalAuth(req, res, next) {
  authenticate(req, res, next);
}
