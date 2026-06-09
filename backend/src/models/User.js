import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'librarian', 'guest'], default: 'librarian' },
    is_active: { type: Boolean, default: true },
    failed_login_attempts: { type: Number, default: 0 },
    locked_until: { type: Date, default: null },
    locale: { type: String, enum: ['en', 'ar'], default: 'ar' },
    last_login: { type: Date },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password_hash);
};

userSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 12);
};

export const User = mongoose.model('User', userSchema);
