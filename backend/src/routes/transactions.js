import { Router } from 'express';
import { Transaction } from '../models/Transaction.js';
import { Book } from '../models/Book.js';
import { Member } from '../models/Member.js';
import { FineConfig } from '../models/FineConfig.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/errors.js';
import { calculateFine } from '../utils/fines.js';

const router = Router();

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

async function getCurrentFineRate() {
  const config = await FineConfig.findOne().sort({ effective_from: -1 });
  return config?.daily_rate ?? 5.0;
}

function resolveStatus(txn) {
  if (txn.status === 'returned') return 'returned';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(txn.expected_return_date);
  due.setHours(0, 0, 0, 0);
  return due < today ? 'overdue' : 'active';
}

function formatTransaction(txn) {
  const status = resolveStatus(txn);
  const member = txn.member_id;
  const book = txn.book_id;
  return {
    transaction_id: txn._id.toString(),
    member_id: member?._id?.toString() || txn.member_id?.toString(),
    member_name: member?.full_name || '',
    book_id: book?._id?.toString() || txn.book_id?.toString(),
    book_title: book?.title || '',
    borrow_date: txn.borrow_date?.toISOString().split('T')[0],
    expected_return_date: txn.expected_return_date?.toISOString().split('T')[0],
    actual_return_date: txn.actual_return_date?.toISOString().split('T')[0] || null,
    fine_amount: txn.fine_amount,
    status,
    is_overdue: status === 'overdue',
  };
}

router.get('/', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const { status, member_name, from, to } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const filter = {};
    if (status === 'returned') {
      filter.status = 'returned';
    } else if (status === 'active' || status === 'overdue') {
      filter.status = { $in: ['active', 'overdue'] };
    } else {
      filter.status = { $ne: 'returned' };
    }

    if (from || to) {
      filter.expected_return_date = {};
      if (from) filter.expected_return_date.$gte = new Date(from);
      if (to) filter.expected_return_date.$lte = new Date(to);
    }

    let query = Transaction.find(filter).populate('member_id').populate('book_id');

    if (member_name) {
      const members = await Member.find({ full_name: { $regex: member_name, $options: 'i' } }).select('_id');
      query = query.where('member_id').in(members.map((m) => m._id));
    }

    const all = await query.sort({ expected_return_date: 1 });
    let filtered = all;
    if (status === 'active') filtered = all.filter((t) => resolveStatus(t) === 'active');
    if (status === 'overdue') filtered = all.filter((t) => resolveStatus(t) === 'overdue');

    const total = filtered.length;
    const pageItems = filtered.slice(skip, skip + limit);

    res.json(paginatedResponse(pageItems.map(formatTransaction), total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get('/:transaction_id', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const txn = await Transaction.findById(req.params.transaction_id)
      .populate('member_id')
      .populate('book_id');
    if (!txn) throw new AppError('Transaction not found', 404, 'NOT_FOUND');
    res.json({ data: formatTransaction(txn) });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const { member_id, book_id, expected_return_date } = req.body;
    if (!member_id || !book_id || !expected_return_date) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    const due = parseLocalDate(expected_return_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    if (due <= today) {
      throw new AppError('Expected return date must be in the future', 400, 'PAST_RETURN_DATE');
    }

    const book = await Book.findOneAndUpdate(
      { _id: book_id, is_active: true, available_copies: { $gte: 1 } },
      { $inc: { available_copies: -1 } },
      { new: true }
    );
    if (!book) {
      const exists = await Book.findById(book_id);
      if (!exists || !exists.is_active) throw new AppError('Book not found', 404, 'NOT_FOUND');
      throw new AppError('Book has no available copies to borrow', 409, 'NO_COPIES_AVAILABLE');
    }

    const member = await Member.findById(member_id);
    if (!member) {
      await Book.findByIdAndUpdate(book_id, { $inc: { available_copies: 1 } });
      throw new AppError('Member not found', 404, 'NOT_FOUND');
    }

    const txn = await Transaction.create({
      member_id,
      book_id,
      borrowed_by: req.user._id,
      expected_return_date: due,
      borrow_date: new Date(),
      status: 'active',
    });

    const populated = await Transaction.findById(txn._id).populate('member_id').populate('book_id');
    res.status(201).json({ data: formatTransaction(populated) });
  } catch (err) {
    next(err);
  }
});

router.post('/:transaction_id/return', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const txn = await Transaction.findById(req.params.transaction_id);
    if (!txn) throw new AppError('Transaction not found', 404, 'NOT_FOUND');
    if (txn.status === 'returned') {
      throw new AppError('This transaction has already been returned', 409, 'ALREADY_RETURNED');
    }

    const dailyRate = await getCurrentFineRate();
    const actualReturn = new Date();
    const { daysOverdue, fineAmount, isOnTime } = calculateFine(
      txn.expected_return_date,
      actualReturn,
      dailyRate
    );

    if (!req.body?.confirm) {
      return res.json({
        data: {
          transaction_id: txn._id.toString(),
          days_overdue: daysOverdue,
          daily_rate: dailyRate,
          fine_amount: fineAmount,
          is_on_time: isOnTime,
        },
      });
    }

    txn.actual_return_date = actualReturn;
    txn.fine_amount = fineAmount;
    txn.status = 'returned';
    await txn.save();

    const book = await Book.findById(txn.book_id);
    if (book) {
      book.available_copies = Math.min(book.total_copies, book.available_copies + 1);
      await book.save();
    }

    if (fineAmount > 0) {
      await Member.findByIdAndUpdate(txn.member_id, { $inc: { outstanding_fine: fineAmount } });
    }

    res.json({
      data: {
        transaction_id: txn._id.toString(),
        actual_return_date: actualReturn.toISOString().split('T')[0],
        fine_amount: fineAmount,
        status: 'returned',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
