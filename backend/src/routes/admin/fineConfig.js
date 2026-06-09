import { Router } from 'express';
import { FineConfig } from '../../models/FineConfig.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { AppError } from '../../utils/errors.js';
import { logAudit } from '../../middleware/audit.js';

const router = Router();

router.get('/', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const config = await FineConfig.findOne().sort({ effective_from: -1 });
    if (!config) {
      return res.json({
        data: { current_rate: 5.0, effective_from: new Date().toISOString(), created_by: null },
      });
    }
    res.json({
      data: {
        current_rate: config.daily_rate,
        effective_from: config.effective_from,
        created_by: config.created_by?.toString() || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { daily_rate } = req.body;
    if (!daily_rate || daily_rate <= 0) {
      throw new AppError('Daily rate must be positive', 400, 'VALIDATION_ERROR');
    }
    const config = await FineConfig.create({
      daily_rate,
      effective_from: new Date(),
      created_by: req.user._id,
    });
    await logAudit(req, 'FINE_RATE_CHANGE', 'FineConfig', config._id);
    res.status(201).json({
      data: {
        current_rate: config.daily_rate,
        effective_from: config.effective_from,
        created_by: config.created_by.toString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
