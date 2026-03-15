import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    const email = "idankzm@gmail.com";
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== 'Admin') {
         existingUser.role = 'Admin';
         await existingUser.save();
         return NextResponse.json({ message: "User already exists. Role updated to Admin." });
      }
      return NextResponse.json({ message: "Admin user already exists." });
    }

    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    
    const newAdmin = new User({
      name: "Idan",
      email,
      password: hashedPassword,
      role: "Admin"
    });

    await newAdmin.save();

    return NextResponse.json({ 
      message: "Admin user created successfully. You can now log in.", 
      credentials: { email: "idankzm@gmail.com", password: "Admin123!" } 
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Failed to set up admin user" }, { status: 500 });
  }
}
