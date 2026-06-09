import { Router } from 'express';
import { User } from '../../models/User.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { parsePagination, paginatedResponse } from '../../utils/pagination.js';
import { AppError } from '../../utils/errors.js';
import { logAudit } from '../../middleware/audit.js';

const router = Router();

function formatUser(user) {
  return {
    user_id: user._id.toString(),
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at,
  };
}

router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { role, is_active, q } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (role) filter.role = role;
    if (is_active !== undefined) filter.is_active = is_active === 'true';
    if (q) {
      filter.$or = [
        { full_name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter).skip(skip).limit(limit).sort({ full_name: 1 });
    res.json(paginatedResponse(users.map(formatUser), total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { full_name, email, role } = req.body;
    if (!full_name || !email || !role) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }
    const tempPassword = 'ChangeMe123!';
    const password_hash = await User.hashPassword(tempPassword);
    const user = await User.create({ full_name, email: email.toLowerCase(), role, password_hash });
    await logAudit(req, 'USER_CREATE', 'User', user._id);
    res.status(201).json({ data: { ...formatUser(user), temp_password: tempPassword } });
  } catch (err) {
    next(err);
  }
});

router.put('/:user_id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const { full_name, email, role } = req.body;
    if (full_name) user.full_name = full_name;
    if (email) user.email = email.toLowerCase();

    if (role && role !== user.role) {
      if (req.user._id.equals(user._id) && role !== 'admin') {
        throw new AppError('Admin cannot remove own admin role', 403, 'SELF_DEMOTION_BLOCKED');
      }
      user.role = role;
      await logAudit(req, 'ROLE_CHANGE', 'User', user._id);
    }

    await user.save();
    res.json({ data: formatUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/:user_id/deactivate', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    user.is_active = false;
    await user.save();
    await logAudit(req, 'USER_DEACTIVATE', 'User', user._id);
    res.json({ data: formatUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/:user_id/activate', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    user.is_active = true;
    await user.save();
    await logAudit(req, 'USER_ACTIVATE', 'User', user._id);
    res.json({ data: formatUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
