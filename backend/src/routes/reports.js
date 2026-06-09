import { Router } from 'express';
import { Book } from '../models/Book.js';
import { Member } from '../models/Member.js';
import { Transaction } from '../models/Transaction.js';
import { FineConfig } from '../models/FineConfig.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parsePagination } from '../utils/pagination.js';
import { daysBetween } from '../utils/fines.js';

const router = Router();

async function getDailyRate() {
  const config = await FineConfig.findOne().sort({ effective_from: -1 });
  return config?.daily_rate ?? 5.0;
}

router.get('/dashboard', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const books = await Book.find({ is_active: true });
    const total_books = books.reduce((s, b) => s + b.total_copies, 0);
    const available_books = books.reduce((s, b) => s + b.available_copies, 0);
    const active_borrows = await Transaction.countDocuments({ status: { $in: ['active', 'overdue'] } });

    const overdueTxns = await Transaction.find({ status: { $in: ['active', 'overdue'] } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue_count = overdueTxns.filter((t) => {
      const due = new Date(t.expected_return_date);
      due.setHours(0, 0, 0, 0);
      return due < today;
    }).length;

    const members = await Member.find();
    const outstanding_fines_total = members.reduce((s, m) => s + (m.outstanding_fine || 0), 0);
    const member_count = await Member.countDocuments({ is_active: true });

    res.json({
      data: {
        total_books,
        available_books,
        active_borrows,
        overdue_count,
        outstanding_fines_total,
        member_count,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/most-borrowed', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const agg = await Transaction.aggregate([
      { $group: { _id: '$book_id', borrow_count: { $sum: 1 } } },
      { $sort: { borrow_count: -1 } },
      { $limit: limit },
    ]);

    const data = await Promise.all(
      agg.map(async (item) => {
        const book = await Book.findById(item._id).populate('category_id');
        return {
          book_id: item._id.toString(),
          title: book?.title || '',
          category: book?.category_id?.name || '',
          borrow_count: item.borrow_count,
        };
      })
    );

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/member-activity', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const agg = await Transaction.aggregate([
      { $group: { _id: '$member_id', borrow_count: { $sum: 1 } } },
      { $sort: { borrow_count: -1 } },
      { $limit: limit },
    ]);

    const data = await Promise.all(
      agg.map(async (item) => {
        const member = await Member.findById(item._id);
        return {
          member_id: item._id.toString(),
          full_name: member?.full_name || '',
          borrow_count: item.borrow_count,
        };
      })
    );

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/overdue', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const dailyRate = await getDailyRate();
    const { page, limit, skip } = parsePagination(req.query);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const txns = await Transaction.find({ status: { $in: ['active', 'overdue'] } })
      .populate('member_id')
      .populate('book_id');

    const overdue = txns
      .filter((t) => {
        const due = new Date(t.expected_return_date);
        due.setHours(0, 0, 0, 0);
        return due < today;
      })
      .map((t) => {
        const days_overdue = daysBetween(t.expected_return_date, today);
        return {
          member_name: t.member_id?.full_name || '',
          book_title: t.book_id?.title || '',
          borrow_date: t.borrow_date?.toISOString().split('T')[0],
          expected_return_date: t.expected_return_date?.toISOString().split('T')[0],
          days_overdue,
          accrued_fine: days_overdue * dailyRate,
        };
      });

    if (req.query.format === 'csv') {
      const headers = 'member_name,book_title,borrow_date,expected_return_date,days_overdue,accrued_fine\n';
      const rows = overdue
        .map(
          (r) =>
            `"${r.member_name}","${r.book_title}",${r.borrow_date},${r.expected_return_date},${r.days_overdue},${r.accrued_fine}`
        )
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=overdue-report.csv');
      return res.send(headers + rows);
    }

    const total = overdue.length;
    const pageItems = overdue.slice(skip, skip + limit);
    const total_fines = overdue.reduce((s, r) => s + r.accrued_fine, 0);

    res.json({
      data: pageItems,
      meta: { total, page, limit, total_fines },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
