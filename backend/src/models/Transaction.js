import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    borrow_date: { type: Date, required: true, default: Date.now },
    expected_return_date: { type: Date, required: true },
    actual_return_date: { type: Date },
    status: { type: String, enum: ['active', 'overdue', 'returned'], default: 'active' },
    fine_amount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

transactionSchema.index({ status: 1 });
transactionSchema.index({ expected_return_date: 1 });
transactionSchema.index({ member_id: 1, status: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
