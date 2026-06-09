import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    title_en: { type: String, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, sparse: true, unique: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    total_copies: { type: Number, required: true, min: 0, default: 1 },
    available_copies: { type: Number, required: true, min: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

bookSchema.index({ title: 'text', author: 'text' });

export const Book = mongoose.model('Book', bookSchema);
