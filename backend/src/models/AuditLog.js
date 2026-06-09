import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    target_entity: { type: String },
    target_id: { type: String },
    ip_address: { type: String },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
