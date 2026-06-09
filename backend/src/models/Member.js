import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    address: { type: String },
    membership_date: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
    outstanding_fine: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const Member = mongoose.model('Member', memberSchema);
