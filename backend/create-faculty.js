const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const uri = 'mongodb://localhost:27017/internship_approval';

async function createFaculty() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    
    // Check if faculty already exists
    const existing = await User.findOne({ email: 'faculty@college.edu' });
    if (existing) {
      console.log('👤 Faculty already exists:', existing.email);
      process.exit();
      return;
    }
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    const faculty = new User({
      name: 'Dr. Smith',
      email: 'faculty@college.edu',
      password: hashedPassword,
      role: 'faculty',
      department: 'Computer Science'
    });
    
    await faculty.save();
    console.log('✅ Faculty user created successfully!');
    console.log('📧 Email: faculty@college.edu');
    console.log('🔑 Password: password123');
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  process.exit();
}

createFaculty();