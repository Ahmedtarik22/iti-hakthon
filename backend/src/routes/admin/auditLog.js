import { Router } from 'express';
import { AuditLog } from '../../models/AuditLog.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { parsePagination, paginatedResponse } from '../../utils/pagination.js';

const router = Router();

router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { user_id, action, from, to } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (user_id) filter.user_id = user_id;
    if (action) filter.action = action;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter).skip(skip).limit(limit).sort({ timestamp: -1 });

    const data = logs.map((l) => ({
      log_id: l._id.toString(),
      user_id: l.user_id?.toString(),
      action: l.action,
      target_entity: l.target_entity,
      target_id: l.target_id,
      timestamp: l.timestamp,
      ip_address: l.ip_address,
    }));

    res.json(paginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

export default router;
