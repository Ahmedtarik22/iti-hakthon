import { Router } from 'express';
import { Member } from '../models/Member.js';
import { Transaction } from '../models/Transaction.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/errors.js';

const router = Router();

function formatMember(member, extra = {}) {
  return {
    member_id: member._id.toString(),
    full_name: member.full_name,
    email: member.email,
    phone: member.phone || '',
    address: member.address || '',
    membership_date: member.membership_date?.toISOString().split('T')[0],
    is_active: member.is_active,
    outstanding_fines_total: member.outstanding_fine,
    updated_at: member.updated_at,
    ...extra,
  };
}

router.get('/', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const { q } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (q) {
      filter.$or = [
        { full_name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await Member.countDocuments(filter);
    const members = await Member.find(filter).skip(skip).limit(limit).sort({ full_name: 1 });

    const data = await Promise.all(
      members.map(async (m) => {
        const active_borrows_count = await Transaction.countDocuments({
          member_id: m._id,
          status: { $in: ['active', 'overdue'] },
        });
        return formatMember(m, { active_borrows_count });
      })
    );

    res.json(paginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get('/:member_id', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.member_id);
    if (!member) throw new AppError('Member not found', 404, 'NOT_FOUND');

    const active_borrows_count = await Transaction.countDocuments({
      member_id: member._id,
      status: { $in: ['active', 'overdue'] },
    });

    res.json({ data: formatMember(member, { active_borrows_count }) });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const { full_name, email, phone, address, membership_date } = req.body;
    if (!full_name || !email || !membership_date) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }
    const member = await Member.create({
      full_name,
      email: email.toLowerCase(),
      phone,
      address,
      membership_date: new Date(membership_date),
    });
    res.status(201).json({ data: formatMember(member) });
  } catch (err) {
    next(err);
  }
});

router.put('/:member_id', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.member_id);
    if (!member) throw new AppError('Member not found', 404, 'NOT_FOUND');

    const { full_name, email, phone, address, membership_date, is_active } = req.body;
    if (full_name) member.full_name = full_name;
    if (email) member.email = email.toLowerCase();
    if (phone !== undefined) member.phone = phone;
    if (address !== undefined) member.address = address;
    if (membership_date) member.membership_date = new Date(membership_date);
    if (is_active !== undefined) member.is_active = is_active;

    await member.save();
    res.json({ data: formatMember(member) });
  } catch (err) {
    next(err);
  }
});

router.get('/:member_id/history', authenticate, requireRole('librarian', 'admin'), async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.member_id);
    if (!member) throw new AppError('Member not found', 404, 'NOT_FOUND');

    const { status, sort } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { member_id: member._id };
    if (status) filter.status = status;

    const sortOrder = sort === 'date_asc' ? { borrow_date: 1 } : { borrow_date: -1 };
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('book_id')
      .skip(skip)
      .limit(limit)
      .sort(sortOrder);

    const data = transactions.map((t) => ({
      transaction_id: t._id.toString(),
      book_title: t.book_id?.title || '',
      borrow_date: t.borrow_date?.toISOString().split('T')[0],
      expected_return_date: t.expected_return_date?.toISOString().split('T')[0],
      actual_return_date: t.actual_return_date?.toISOString().split('T')[0] || null,
      fine_amount: t.fine_amount,
      status: t.status,
    }));

    res.json(paginatedResponse(data, total, page, limit));
  } catch (err) {
    next(err);
  }
});

export default router;
