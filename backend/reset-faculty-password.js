const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/internship_approval')
.then(async () => {
  const faculty = await User.findOne({ role: 'faculty' });
  
  if (faculty) {
    // Reset password to 'password123'
    faculty.password = await bcrypt.hash('password123', 10);
    await faculty.save();
    console.log('✅ Password reset successful!');
    console.log('📧 Email:', faculty.email);
    console.log('🔑 New Password: password123');
  } else {
    console.log('❌ No faculty user found!');
  }
  
  process.exit();
})
.catch(err => {
  console.log('Error:', err.message);
  process.exit();
});