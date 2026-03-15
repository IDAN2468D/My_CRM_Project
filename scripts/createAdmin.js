const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String, select: false },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const adminEmail = 'admin@crm.com';
  const existingUser = await User.findOne({ email: adminEmail });

  if (existingUser) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = new User({
    name: 'Idan Admin',
    email: adminEmail,
    password: hashedPassword,
  });

  await admin.save();
  console.log('Admin user created successfully!');
  console.log('Email: admin@crm.com');
  console.log('Password: admin132'); // Note to user: password is admin123
  
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
