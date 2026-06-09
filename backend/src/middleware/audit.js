import { AuditLog } from '../models/AuditLog.js';

export async function logAudit(req, action, targetEntity, targetId) {
  if (!req.user) return;
  await AuditLog.create({
    user_id: req.user._id,
    action,
    target_entity: targetEntity,
    target_id: targetId?.toString(),
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
  });
}
