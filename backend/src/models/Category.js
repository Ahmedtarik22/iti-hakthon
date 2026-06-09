import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

export const Category = mongoose.model('Category', categorySchema);
