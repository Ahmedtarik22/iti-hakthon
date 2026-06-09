import { Router } from 'express';
import { Book } from '../models/Book.js';
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/errors.js';

const router = Router();

function formatBook(book) {
  const cat = book.category_id;
  return {
    book_id: book._id.toString(),
    title: book.title,
    title_en: book.title_en || '',
    author: book.author,
    category: cat
      ? { category_id: cat._id?.toString() || cat.toString(), name: cat.name || '' }
      : null,
    total_copies: book.total_copies,
    available_copies: book.available_copies,
    is_active: book.is_active,
    isbn: book.isbn,
  };
}

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { q, availability, category_id } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { is_active: true };

    if (category_id) filter.category_id = category_id;

    if (availability === 'available') filter.available_copies = { $gt: 0 };
    if (availability === 'borrowed') filter.$expr = { $lt: ['$available_copies', '$total_copies'] };

    let query = Book.find(filter).populate('category_id');

    if (q) {
      const cats = await Category.find({ name: { $regex: q, $options: 'i' } }).select('_id');
      const catIds = cats.map((c) => c._id);
      query = Book.find({
        ...filter,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { title_en: { $regex: q, $options: 'i' } },
          { author: { $regex: q, $options: 'i' } },
          ...(catIds.length ? [{ category_id: { $in: catIds } }] : []),
        ],
      }).populate('category_id');
    }

    const total = await Book.countDocuments(query.getFilter());
    const books = await query.skip(skip).limit(limit).sort({ title: 1 });

    res.json(paginatedResponse(books.map(formatBook), total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get('/:book_id', authenticate, async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.book_id).populate('category_id');
    if (!book || !book.is_active) throw new AppError('Book not found', 404, 'NOT_FOUND');
    res.json({ data: formatBook(book) });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const { title, title_en, author, category_id, total_copies, isbn } = req.body;
    if (!title || !author || !category_id || total_copies == null) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }
    const copies = Math.max(1, parseInt(total_copies, 10));
    const book = await Book.create({
      title,
      title_en,
      author,
      category_id,
      total_copies: copies,
      available_copies: copies,
      isbn,
    });
    const populated = await Book.findById(book._id).populate('category_id');
    res.status(201).json({ data: formatBook(populated) });
  } catch (err) {
    next(err);
  }
});

router.put('/:book_id', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.book_id);
    if (!book) throw new AppError('Book not found', 404, 'NOT_FOUND');

    const { title, title_en, author, category_id, total_copies, force } = req.body;
    if (title) book.title = title;
    if (title_en !== undefined) book.title_en = title_en;
    if (author) book.author = author;
    if (category_id) book.category_id = category_id;

    if (total_copies != null) {
      const newTotal = parseInt(total_copies, 10);
      const borrowed = book.total_copies - book.available_copies;
      if (newTotal < borrowed && !force) {
        const populated = await Book.findById(book._id).populate('category_id');
        return res.status(200).json({
          data: formatBook(populated),
          warning: 'copies_below_borrowed',
        });
      }
      book.total_copies = newTotal;
      book.available_copies = Math.max(0, newTotal - borrowed);
    }

    await book.save();
    const populated = await Book.findById(book._id).populate('category_id');
    res.json({ data: formatBook(populated) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:book_id', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.book_id);
    if (!book) throw new AppError('Book not found', 404, 'NOT_FOUND');

    const activeBorrows = await Transaction.countDocuments({
      book_id: book._id,
      status: { $in: ['active', 'overdue'] },
    });
    if (activeBorrows > 0) {
      throw new AppError('Cannot delete book with active borrows', 409, 'ACTIVE_BORROWS_EXIST');
    }

    book.is_active = false;
    await book.save();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
