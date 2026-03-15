import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: String,
  action: {
    type: String,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  details: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
