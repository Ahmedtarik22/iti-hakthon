import { Router } from 'express';
import { Category } from '../models/Category.js';
import { Book } from '../models/Book.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const data = await Promise.all(
      categories.map(async (cat) => {
        const book_count = await Book.countDocuments({ category_id: cat._id, is_active: true });
        return { category_id: cat._id.toString(), name: cat.name, book_count };
      })
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) throw new AppError('Name is required', 400, 'VALIDATION_ERROR');
    const cat = await Category.create({ name: name.trim() });
    await logAudit(req, 'CATEGORY_CREATE', 'Category', cat._id);
    res.status(201).json({ data: { category_id: cat._id.toString(), name: cat.name } });
  } catch (err) {
    next(err);
  }
});

router.put('/:category_id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.category_id);
    if (!cat) throw new AppError('Category not found', 404, 'NOT_FOUND');
    if (req.body.name) cat.name = req.body.name.trim();
    await cat.save();
    await logAudit(req, 'CATEGORY_UPDATE', 'Category', cat._id);
    res.json({ data: { category_id: cat._id.toString(), name: cat.name } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:category_id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.category_id);
    if (!cat) throw new AppError('Category not found', 404, 'NOT_FOUND');

    const count = await Book.countDocuments({ category_id: cat._id, is_active: true });
    if (count > 0) {
      throw new AppError('Reassign books before deleting category', 409, 'CATEGORY_HAS_BOOKS');
    }

    await cat.deleteOne();
    await logAudit(req, 'CATEGORY_DELETE', 'Category', req.params.category_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
