import mongoose from 'mongoose';

const fineConfigSchema = new mongoose.Schema(
  {
    daily_rate: { type: Number, required: true, min: 0.01 },
    effective_from: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

export const FineConfig = mongoose.model('FineConfig', fineConfigSchema);
