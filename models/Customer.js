import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'נא להזין שם לקוח'],
  },
  phone: {
    type: String,
    required: [true, 'נא להזין מספר טלפון'],
  },
  email: {
    type: String,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Completed'],
    default: 'New',
  },
  notes: [NoteSchema],
  tasks: [TaskSchema],
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: 'application/pdf' },
    uploadedAt: { type: Date, default: Date.now }
  }],
}, { 
  timestamps: true 
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
