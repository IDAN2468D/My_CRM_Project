import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'נא להזין שם'],
  },
  email: {
    type: String,
    required: [true, 'נא להזין אימייל'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'נא להזין סיסמה'],
    select: false,
  },
  role: {
    type: String,
    enum: ['Admin', 'Agent'],
    default: 'Agent',
  },
  geminiApiKey: {
    type: String,
    default: '',
  },
}, { 
  timestamps: true 
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
